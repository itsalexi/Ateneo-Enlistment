import localFont from 'next/font/local';
import './globals.css';
import {
    FavoriteCoursesProvider,
    SelectedCoursesProvider,
} from '@/lib/context';
import Nav from '@/components/Nav';
import { Toaster } from '@/components/ui/toaster';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
});

export const metadata = {
    title: {
        default: 'Ateneo Enlistment Helper',
        template: '%s | Ateneo Enlistment Helper',
    },
    description:
        'Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently. Find courses, check schedules, and create your ideal timetable for Ateneo de Manila University.',
    keywords: [
        'Ateneo de Manila University',
        'Ateneo enlistment',
        'course registration',
        'class schedule',
        'university enrollment',
        'Ateneo courses',
        'academic planning',
        'semester scheduling',
        'university timetable',
        'course finder',
        'ADMU enrollment',
        'Philippines university',
        'higher education',
    ],
    authors: [{ name: 'Alexi Canamo' }],
    creator: 'Alexi Canamo',
    publisher: 'Ateneo Enlistment Helper',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://schedule.alexi.life'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://schedule.alexi.life',
        title: 'Ateneo Enlistment Helper - Course Registration Made Easy',
        description:
            'Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently.',
        siteName: 'Ateneo Enlistment Helper',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Ateneo Enlistment Helper - Course Registration Interface',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ateneo Enlistment Helper - Course Registration Made Easy',
        description:
            'Streamline your Ateneo course registration. Browse classes, build schedules, and plan your semester efficiently.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    category: 'education',
    classification: 'Education',
    referrer: 'origin-when-cross-origin',
    colorScheme: 'dark light',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#121212' },
    ],
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
    appleWebApp: {
        title: 'Ateneo Enlistment Helper',
        statusBarStyle: 'default',
        capable: true,
    },
    applicationName: 'Ateneo Enlistment Helper',
    appLinks: {
        web: {
            url: 'https://schedule.alexi.life',
            should_fallback: true,
        },
    },
    archives: ['https://schedule.alexi.life/sitemap.xml'],
    bookmarks: ['https://schedule.alexi.life'],
    category: 'education',
    other: {
        'msapplication-TileColor': '#121212',
        'msapplication-config': '/browserconfig.xml',
        'apple-mobile-web-app-title': 'Ateneo Helper',
        'application-name': 'Ateneo Enlistment Helper',
        'msapplication-tooltip': 'Ateneo Course Registration Helper',
        'msapplication-starturl': '/',
        'mobile-web-app-capable': 'yes',
        'apple-touch-fullscreen': 'yes',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="manifest" href="/manifest.json" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: 'Ateneo Enlistment Helper',
                            description:
                                'Streamline your Ateneo course registration with our comprehensive enlistment helper. Browse available classes, filter by program, build your schedule, and plan your semester efficiently.',
                            url: 'https://schedule.alexi.life',
                            applicationCategory: 'EducationalApplication',
                            operatingSystem: 'Web',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'USD',
                            },
                            author: {
                                '@type': 'Person',
                                name: 'Alexi Canamo',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'Ateneo Enlistment Helper',
                            },
                            about: {
                                '@type': 'Thing',
                                name: 'Ateneo de Manila University Course Registration',
                            },
                            audience: {
                                '@type': 'Audience',
                                audienceType: 'Students',
                            },
                            educationalUse: 'Course Planning',
                            interactivityType: 'Active',
                            learningResourceType: 'Interactive Resource',
                            typicalAgeRange: '18-25',
                        }),
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <SelectedCoursesProvider>
                    <FavoriteCoursesProvider>
                        <Nav />
                        <Toaster />
                        {children}
                    </FavoriteCoursesProvider>
                </SelectedCoursesProvider>
                <script
                    defer
                    src="https://static.cloudflareinsights.com/beacon.min.js"
                    data-cf-beacon='{"token": "2aafb9d1938641b7aa527cbb43014b2e"}'
                ></script>
            </body>
        </html>
    );
}
