import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Ateneo Enlistment Helper",
    template: "%s | Ateneo Enlistment Helper",
  },
  description:
    "Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently. Find courses, check schedules, and create your ideal timetable for Ateneo de Manila University.",
  keywords: [
    "Ateneo de Manila University",
    "Ateneo enlistment",
    "course registration",
    "class schedule",
    "university enrollment",
    "Ateneo courses",
    "academic planning",
    "semester scheduling",
    "university timetable",
    "course finder",
    "ADMU enrollment",
    "Philippines university",
    "higher education",
  ],
  authors: [{ name: "Alexi Canamo" }],
  creator: "Alexi Canamo",
  publisher: "Ateneo Enlistment Helper",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://schedule.alexi.life"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://schedule.alexi.life",
    title: "Ateneo Enlistment Helper",
    description:
      "Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently.",
    siteName: "Ateneo Enlistment Helper",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ateneo Enlistment Helper - Course Registration Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ateneo Enlistment Helper - Course Registration Made Easy",
    description:
      "Streamline your Ateneo course registration. Browse classes, build schedules, and plan your semester efficiently.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
  classification: "Education",
  referrer: "origin-when-cross-origin",
  applicationName: "Ateneo Enlistment Helper",
  appleWebApp: {
    title: "Ateneo Enlistment Helper",
    statusBarStyle: "default",
    capable: true,
  },
  appLinks: {
    web: {
      url: "https://schedule.alexi.life",
      should_fallback: true,
    },
  },
  archives: ["https://schedule.alexi.life/sitemap.xml"],
  bookmarks: ["https://schedule.alexi.life"],
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#121212",
    "msapplication-config": "/browserconfig.xml",
    "apple-mobile-web-app-title": "Ateneo Helper",
    "application-name": "Ateneo Enlistment Helper",
    "msapplication-tooltip": "Ateneo Course Registration Helper",
    "msapplication-starturl": "/",
    "mobile-web-app-capable": "yes",
    "apple-touch-fullscreen": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0f141b"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#f6f1e8"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Ateneo Enlistment Helper",
              description:
                "Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently.",
              url: "https://schedule.alexi.life",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Alexi Canamo",
              },
              publisher: {
                "@type": "Organization",
                name: "Ateneo Enlistment Helper",
              },
              about: {
                "@type": "Thing",
                name: "Ateneo de Manila University Course Registration",
              },
              audience: {
                "@type": "Audience",
                audienceType: "Students",
              },
              educationalUse: "Course Planning",
              interactivityType: "Active",
              learningResourceType: "Interactive Resource",
              typicalAgeRange: "18-25",
            }),
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ui-theme');if(t==='dark'){document.body.setAttribute('data-theme','dark');}else{document.body.removeAttribute('data-theme');}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
