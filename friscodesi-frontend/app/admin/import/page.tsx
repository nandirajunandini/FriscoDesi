"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

interface Place {
  id: string;
  name: string;
  address: string;
  zipCode?: string;
  rating: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
}

interface Category {
  id: number;
  documentId: string;
  name: string;
}

export default function AdminImportPage() {
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [importing, setImporting] = useState("");

  const [unimporting, setUnimporting] = useState("");

  const [places, setPlaces] = useState<Place[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [foodType, setFoodType] =
    useState("");

  /*
    Google Place ID -> Strapi documentId

    Example:

    {
      "ChIJ123": "abc123"
    }
  */
  const [importedListings, setImportedListings] =
    useState<Record<string, string>>({});


  /*
    ==========================
    Load Categories
    ==========================
  */

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(
          "/api/admin/categories"
        );

        const data = await res.json();

        setCategories(
          data.categories ||
          data.data ||
          []
        );
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );
      }
    }

    loadCategories();
  }, []);


  /*
    ==========================
    Search Google Places
    ==========================
  */

  const searchPlaces = async () => {
    if (!query.trim()) {
      alert("Please enter search term");
      return;
    }

    if (!selectedCategory) {
      alert("Please select category");
      return;
    }

    setLoading(true);
    setMessage("");

    /*
      Clear previous import status
      while searching
    */

    setImportedListings({});

    try {
      /*
        Step 1:
        Search Google Places
      */

      const res = await fetch(
        "/api/admin/import/search",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            query,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
          "Search failed"
        );

        setPlaces([]);

        return;
      }


      const searchResults: Place[] =
        data.places || [];


      setPlaces(searchResults);


      /*
        ==================================
        Step 2:
        Check which businesses are already
        imported in Strapi
        ==================================
      */

      if (searchResults.length > 0) {

        const placeIds =
          searchResults
            .map(
              (place) =>
                place.id
            )
            .filter(Boolean);


        if (placeIds.length > 0) {

          try {

            const statusRes =
              await fetch(
                "/api/admin/import/status",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    placeIds,
                  }),
                }
              );


            const statusData =
              await statusRes.json();


            if (!statusRes.ok) {

              console.error(
                "Import status check failed:",
                statusData
              );

            } else {

              console.log(
                "Imported listings:",
                statusData.imported
              );


              /*
                Example result:

                {
                  "ChIJ123":
                    "documentId123",

                  "ChIJ456":
                    "documentId456"
                }
              */

              setImportedListings(
                statusData.imported ||
                {}
              );
            }

          } catch (error) {

            console.error(
              "Status API error:",
              error
            );

          }
        }
      }

    } catch (error) {

      console.error(
        "Search error:",
        error
      );

      alert(
        "Unable to fetch places"
      );

      setPlaces([]);

    } finally {

      setLoading(false);

    }
  };


  /*
    ==========================
    Import Business
    ==========================
  */

  const importBusiness = async (
    place: Place
  ) => {

    setImporting(place.id);

    setMessage("");

    try {

      const res = await fetch(
        "/api/admin/import/save",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            ...place,

            category:
              Number(selectedCategory),

            attributes: {
              foodType:
                foodType ||
                "Not Applicable",
            },

          }),
        }
      );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.error ||
          "Import failed"
        );

        return;
      }


      /*
        Get Strapi documentId
      */

      const documentId =
        data?.documentId ||
        data?.listing?.documentId ||
        data?.data?.documentId ||
        data?.listing?.data?.documentId;


      console.log(
        "Import response:",
        data
      );

      console.log(
        "Document ID:",
        documentId
      );


      if (!documentId) {

        alert(
          "Business imported, but documentId was not returned."
        );

        return;
      }


      /*
        Store imported status
      */

      setImportedListings(
        (previous) => ({
          ...previous,

          [place.id]:
            documentId,
        })
      );


      setMessage(
        `${place.name} imported successfully`
      );


    } catch (error) {

      console.error(
        "Import error:",
        error
      );

      alert(
        "Import failed"
      );

    } finally {

      setImporting("");

    }
  };


  /*
    ==========================
    Un-import Business
    ==========================
  */

  const unimportBusiness = async (
    place: Place
  ) => {

    const documentId =
      importedListings[place.id];


    if (!documentId) {

      alert(
        "Document ID not found for this listing."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to un-import "${place.name}"?\n\nThis will delete the listing and its images.`
      );


    if (!confirmed) {
      return;
    }


    setUnimporting(place.id);

    setMessage("");


    try {

      const res = await fetch(
        `/api/admin/import/delete/${documentId}`,
        {
          method: "DELETE",
        }
      );


      const data =
        await res.json();


      if (!res.ok) {

        alert(
          data.error ||
          "Failed to un-import listing"
        );

        return;
      }


      /*
        Remove from imported map
      */

      setImportedListings(
        (previous) => {

          const updated = {
            ...previous,
          };

          delete updated[place.id];

          return updated;
        }
      );


      setMessage(
        `${place.name} was un-imported successfully`
      );


    } catch (error) {

      console.error(
        "Un-import error:",
        error
      );

      alert(
        "Failed to un-import listing"
      );

    } finally {

      setUnimporting("");

    }
  };


  /*
    ==========================
    Selected Category
    ==========================
  */

  const selectedCategoryName =
    categories.find(
      (cat) =>
        String(cat.id) ===
        selectedCategory
    )?.name;


  const isFoodCategory =
    selectedCategoryName
      ?.toLowerCase()
      .includes("food");


  /*
    ==========================
    UI
    ==========================
  */

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <AdminHeader />

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold mb-8">
            Import Businesses
          </h1>


          {message && (
            <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl">
              {message}
            </div>
          )}


          {/* ==========================
              Filters
          ========================== */}

          <div className="grid md:grid-cols-3 gap-4 mb-8">


            {/* Category */}

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="border rounded-xl px-4 py-3"
            >

              <option value="">
                Select Category
              </option>


              {categories.map(
                (category) => (

                  <option
                    key={category.id}
                    value={category.id}
                  >

                    {category.name}

                  </option>

                )
              )}

            </select>


            {/* Search */}

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search businesses"
              className="border rounded-xl px-4 py-3"
            />


            {/* Food Type */}

            {isFoodCategory && (

              <select
                value={foodType}
                onChange={(e) =>
                  setFoodType(
                    e.target.value
                  )
                }
                className="border rounded-xl px-4 py-3"
              >

                <option value="">
                  Select Food Type
                </option>

                <option value="Pure Veg">
                  Pure Veg
                </option>

                <option value="Non Veg">
                  Non Veg
                </option>

                <option value="Veg & Non Veg">
                  Veg & Non Veg
                </option>

              </select>

            )}


            {/* Search */}

            <button
              onClick={searchPlaces}
              disabled={loading}
              className="bg-indigo-600 text-white rounded-xl py-3 hover:bg-indigo-700 disabled:opacity-50"
            >

              {loading
                ? "Searching..."
                : "Search"}

            </button>

          </div>


          {/* ==========================
              Results
          ========================== */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">


            {places.length === 0 &&
              !loading && (

                <div className="col-span-full text-center text-gray-500 py-10">

                  Search businesses to import

                </div>

              )}


            {places.map(
              (place) => {

                const documentId =
                  importedListings[
                    place.id
                  ];


                const isImported =
                  Boolean(documentId);


                const isImporting =
                  importing ===
                  place.id;


                const isUnimporting =
                  unimporting ===
                  place.id;


                return (

                  <div
                    key={place.id}
                    className="bg-gray-50 border rounded-2xl p-6 shadow-sm hover:shadow-lg"
                  >

                    <h2 className="text-xl font-bold">
                      {place.name}
                    </h2>


                    <p className="mt-3 text-gray-600">
                      📍 {place.address}
                    </p>


                    {place.zipCode && (

                      <p className="mt-2 text-gray-600">
                        📮 Zip Code:{" "}
                        {place.zipCode}
                      </p>

                    )}


                    <p className="mt-3">
                      ⭐ {place.rating}
                    </p>


                    {place.reviewCount && (

                      <p className="text-gray-600">
                        👥{" "}
                        {place.reviewCount}{" "}
                        reviews
                      </p>

                    )}


                    {place.phone && (

                      <p className="mt-3">
                        📞 {place.phone}
                      </p>

                    )}


                    {place.website && (

                      <a
                        href={
                          place.website
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3 text-blue-600 break-all"
                      >

                        🌐 Website

                      </a>

                    )}


                    {/* ==========================
                        Imported
                    ========================== */}

                    {isImported && (

                      <>
                        <div className="mt-5 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-medium">

                          ✓ Imported

                        </div>


                        <button
                          onClick={() =>
                            unimportBusiness(
                              place
                            )
                          }
                          disabled={
                            isUnimporting
                          }
                          className="w-full mt-3 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50"
                        >

                          {isUnimporting
                            ? "Un-importing..."
                            : "Un-import"}

                        </button>

                      </>

                    )}


                    {/* ==========================
                        Not Imported
                    ========================== */}

                    {!isImported && (

                      <button
                        onClick={() =>
                          importBusiness(
                            place
                          )
                        }
                        disabled={
                          isImporting
                        }
                        className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
                      >

                        {isImporting
                          ? "Importing..."
                          : "Import Business"}

                      </button>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </div>

      </div>

    </div>
  );
}