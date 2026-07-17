import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/LocaleProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alkule — Learn ADLaM",
  description:
    "Learn to read, write, and type the ADLaM script of the Fulani people. Games, courses, books, and culture — in Fulfulde, English, French, and Arabic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Display, body, and ADLaM faces. Swap to `next/font` later to
            self-host at build time (better for low-bandwidth users). */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Inter:wght@400;500;600&family=Noto+Sans+Adlam:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-paper text-ink min-h-screen flex flex-col">
        <LocaleProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
