import "./globals.css";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

export const metadata = {
  title: "FriscoDesi",
  description: "Community hub for Frisco residents",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const userToken = cookieStore.get("userToken")?.value;
  const adminToken = cookieStore.get("adminToken")?.value;

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Navbar
          isUserLoggedIn={!!userToken}
          isAdminLoggedIn={!!adminToken}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}