import type { Metadata, Viewport } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { site } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";
import { Navbar } from "@/components/Navbar";
import { CustomCursor } from "@/components/CustomCursor";
import { AnimationProvider } from "@/components/motion/AnimationProvider";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-code",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MSDEV — Premium Web Development & Digital Experiences",
    template: "%s — MSDEV",
  },
  description:
    "MSDEV is a premium web development studio in Oran, Algeria. Custom websites, web applications, e-commerce and immersive 3D experiences — designed, engineered and shipped to make brands stand out.",
  keywords: [
    "web development",
    "web design",
    "3D websites",
    "Next.js developer",
    "e-commerce development",
    "landing pages",
    "UI UX design",
    "Oran",
    "Algeria",
    "MSDEV",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: site.name,
    title: "MSDEV — Premium Web Development & Digital Experiences",
    description:
      "Custom websites, web applications and immersive 3D experiences, designed and built to make your business impossible to overlook.",
    images: [
      {
        url: "/media/og.jpg",
        width: 1200,
        height: 630,
        alt: "MSDEV — premium web development and digital experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MSDEV — Premium Web Development & Digital Experiences",
    description:
      "Custom websites, web applications and immersive 3D experiences built by MSDEV.",
    images: ["/media/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Structured data so search engines understand who MSDEV is. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}#organization`,
  name: site.name,
  legalName: site.legalName,
  url: siteUrl,
  email: site.email,
  telephone: site.phone.tel,
  description: site.description,
  image: `${siteUrl}/media/og.jpg`,
  logo: `${siteUrl}/icon.svg`,
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressCountry: "DZ",
  },
  sameAs: site.socials.map((social) => social.href),
  serviceType: [
    "Web development",
    "Web design",
    "E-commerce development",
    "3D web experiences",
    "UI/UX design",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable} ${mono.variable}`}>
      <body className="bg-void text-ivory antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-ivory px-5 py-3 font-mono text-xs tracking-widest text-void uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]"
        >
          Skip to content
        </a>

        <AnimationProvider />
        <CustomCursor />
        <Navbar />

        <main id="main">{children}</main>

        <span className="grain" aria-hidden="true" />

        {/* Static, author-controlled JSON-LD — no user input reaches this string. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
