import { notFound } from "next/navigation";

import ListingHero from "./ListingHero";
import BusinessInfo from "./BusinessInfo";
import Gallery from "./Gallery";
import GoogleMap from "./GoogleMap";
import Reviews from "./Reviews";
import SimilarBusinesses from "./SimilarBusinesses";
import FavoriteButton from "./FavoriteButton";

/* ============================= */
/* Interfaces                    */
/* ============================= */

export interface Section {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  section?: Section;
}

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: string;
}

export interface GoogleData {
  photos?: any[];
  reviews?: GoogleReview[];
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
}

export interface Listing {
  id: number;
  documentId?: string;

  name: string;
  slug: string;

  address: string;

  rating: number;
  reviewCount?: number;

  description: any;

  phone?: string;
  website?: string;

  image?: string;
  photos?: string[];

  openingHours?: string[];

  latitude?: number;
  longitude?: number;

  googlePlaceId?: string;
  googleData?: GoogleData;

  category: Category;
}

export interface SimilarBusiness {
  id: number;
  documentId?: string;

  name: string;
  slug: string;

  address: string;

  rating: number;

  image?: string;

  category: Category;
}

/* ============================= */
/* Fetch Listing                 */
/* ============================= */

async function getListing(
  slug: string
): Promise<Listing | null> {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/listings?filters[slug][$eq]=${slug}&populate[category][populate]=section&populate[images]=true`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  const json = await res.json();

  if (!json.data?.length) {
    return null;
  }

  const item = json.data[0];

  console.log(
    "STRAPI ITEM:",
    JSON.stringify(item, null, 2)
  );

  const listing: Listing = {
    id: item.id,

    documentId: item.documentId,

    name: item.name,

    slug: item.slug,

    address: item.address ?? "",

    rating: item.rating ?? 0,

    reviewCount: item.reviewCount ?? 0,

    description: item.description,

    phone: item.phone ?? "",

    website: item.website ?? "",

    image: item.images?.[0]?.url
      ? `${process.env.STRAPI_URL}${item.images[0].url}`
      : "",

    photos:
      item.images?.map(
        (photo: any) =>
          `${process.env.STRAPI_URL}${photo.url}`
      ) ?? [],

    openingHours:
      item.openingHours ?? [],

    latitude:
      item.latitude,

    longitude:
      item.longitude,

    googlePlaceId:
      item.googlePlaceId ?? "",

    category: {
      id: item.category?.id,

      documentId:
        item.category?.documentId,

      name:
        item.category?.name ??
        "Category",

      slug:
        item.category?.slug ??
        "category",

      section:
        item.category?.section
          ? {
              id:
                item.category.section.id,

              documentId:
                item.category.section.documentId,

              name:
                item.category.section.name,

              slug:
                item.category.section.slug,
            }
          : undefined,
    },
  };

  /* ============================= */
  /* Google Place Details          */
  /* ============================= */

  try {
    let placeId =
      listing.googlePlaceId;

    /* ==========================================
       Search Google if Place ID is missing
    ========================================== */

    if (!placeId) {
      const searchQuery =
        `${listing.name}, ${listing.address}`;

      const searchRes =
        await fetch(
          `http://localhost:3000/api/test-places?query=${encodeURIComponent(
            searchQuery
          )}`,
          {
            cache: "no-store",
          }
        );

      if (searchRes.ok) {
        const searchData =
          await searchRes.json();

        placeId =
          searchData.places?.[0]?.id ??
          "";

        listing.googlePlaceId =
          placeId;
      }
    }

    /* ==========================================
       Fetch Google Place Details
    ========================================== */

    if (placeId) {
      const detailsRes =
        await fetch(
          `http://localhost:3000/api/place-details?placeId=${placeId}`,
          {
            cache: "no-store",
          }
        );

      if (detailsRes.ok) {
        const googleData =
          await detailsRes.json();

        listing.googleData = {
          ...googleData,

          reviews:
            googleData.reviews?.map(
              (review: any) => ({
                author:
                  review
                    .authorAttribution
                    ?.displayName ??
                  "Google User",

                rating:
                  review.rating ?? 0,

                text:
                  review.text ?? "",

                time:
                  review
                    .relativePublishTimeDescription ??
                  "",
              })
            ) ?? [],
        };

        listing.phone =
          googleData
            .internationalPhoneNumber ??
          listing.phone;

        listing.website =
          googleData.websiteUri ??
          listing.website;

        listing.rating =
          googleData.rating ??
          listing.rating;

        listing.reviewCount =
          googleData.userRatingCount ??
          listing.reviewCount;

        listing.openingHours =
          googleData
            .regularOpeningHours
            ?.weekdayDescriptions ??
          listing.openingHours;

        if (
          googleData.photos?.length
        ) {
          const googlePhotos =
            googleData.photos.map(
              (photo: any) =>
                `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&maxWidthPx=1200&key=${process.env.GOOGLE_PLACES_API_KEY}`
            );

          listing.photos =
            googlePhotos;

          listing.image =
            googlePhotos[0];
        }
      }
    }
  } catch (error) {
    console.error(
      "Google Details Error:",
      error
    );
  }

  return listing;
}

/* ============================= */
/* Fetch Similar Businesses      */
/* ============================= */

async function getSimilarBusinesses(
  listing: Listing
): Promise<SimilarBusiness[]> {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/listings?filters[category][slug][$eq]=${listing.category.slug}&filters[slug][$ne]=${listing.slug}&populate[images]=true&populate[category]=true&pagination[pageSize]=6`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.log(
        "Status:",
        res.status
      );

      console.log(
        await res.text()
      );

      return [];
    }

    const json =
      await res.json();

    console.log(
      "Similar API Count:",
      json.data.length
    );

    console.log(
      "Similar API:",
      json.data
    );

    console.log(
      "TOP RATED:",
      json
    );

    return (
      json.data?.map(
        (item: any) => ({
          id: item.id,

          documentId:
            item.documentId,

          name: item.name,

          slug: item.slug,

          address:
            item.address ?? "",

          rating:
            item.rating ?? 0,

          image:
            item.images?.[0]?.url
              ? `${process.env.STRAPI_URL}${item.images[0].url}`
              : "",

          category: {
            id:
              item.category?.id,

            documentId:
              item.category
                ?.documentId,

            name:
              item.category?.name ??
              "",

            slug:
              item.category?.slug ??
              "",
          },
        })
      ) ?? []
    );
  } catch (error) {
    console.error(
      "Similar Businesses Error:",
      error
    );

    return [];
  }
}

/* ============================= */
/* Fetch Top Rated Businesses    */
/* ============================= */

async function getTopRatedBusinesses(): Promise<
  SimilarBusiness[]
> {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/listings?sort=rating:desc&populate[images]=true&populate[category]=true&pagination[pageSize]=6`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.log(
        "Status:",
        res.status
      );

      console.log(
        await res.text()
      );

      return [];
    }

    const json =
      await res.json();

    return (
      json.data?.map(
        (item: any) => ({
          id: item.id,

          documentId:
            item.documentId,

          name: item.name,

          slug: item.slug,

          address:
            item.address ?? "",

          rating:
            item.rating ?? 0,

          image:
            item.images?.[0]?.url
              ? `${process.env.STRAPI_URL}${item.images[0].url}`
              : "",

          category: {
            id:
              item.category?.id,

            documentId:
              item.category
                ?.documentId,

            name:
              item.category?.name ??
              "",

            slug:
              item.category?.slug ??
              "",
          },
        })
      ) ?? []
    );
  } catch (error) {
    console.error(
      "Top Rated Error:",
      error
    );

    return [];
  }
}

/* ============================= */
/* Page Component                */
/* ============================= */

export default async function ListingPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  const listing =
    await getListing(slug);

  if (!listing) {
    return notFound();
  }

  /* =============================
     Fetch Recommendation Data
  ============================= */

  const [
    similarBusinesses,
    topRatedBusinesses,
  ] = await Promise.all([
    getSimilarBusinesses(
      listing
    ),

    getTopRatedBusinesses(),
  ]);

  console.log(
    "similarBusinesses:",
    similarBusinesses.length
  );

  console.log(
    "topRatedBusinesses:",
    topRatedBusinesses.length
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 via-white to-blue-50">

      {/* =========================
          Hero
      ========================= */}

      <div className="relative">

        <ListingHero
          listing={listing}
        />

        {/* =========================
            Favorite Button
        ========================= */}

        <div className="absolute top-6 right-6 z-20">

          <FavoriteButton
            listingId={listing.id}
          />

        </div>

      </div>

      {/* =========================
          Business Information
      ========================= */}

      <BusinessInfo
        listing={listing}
      />

      {/* =========================
          Gallery
      ========================= */}

      <Gallery
        listing={listing}
      />

      {/* =========================
          Google Map
      ========================= */}

      <GoogleMap
        listing={listing}
      />

      {/* =========================
          Reviews
      ========================= */}

      <Reviews
        listing={listing}
      />

      {/* =========================
          Similar Businesses
      ========================= */}

      <SimilarBusinesses
        listing={listing}
        businesses={
          similarBusinesses
        }
        topRated={
          topRatedBusinesses
        }
      />

    </main>
  );
}