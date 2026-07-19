import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/LocaleProvider";
import { ProfileProvider } from "@/lib/ProfileProvider";
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
        {/* Body/display = Hanken Grotesk (Material 3 design system); ADLaM
            glyphs = Noto Sans Adlam; Material Symbols for UI icons. Swap to
            `next/font` later to self-host at build time. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=Noto+Sans+Adlam:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-paper text-ink min-h-screen flex flex-col">
        <LocaleProvider>
          <ProfileProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ProfileProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
