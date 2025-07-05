export const metadata = {
    title: 'My Schedule - Plan Your Semester',
    description:
        "View and manage your selected courses in an organized schedule format. Build your ideal timetable, export your schedule, and ensure your classes don't conflict. Perfect for Ateneo students planning their semester.",
    keywords: [
        'Ateneo schedule',
        'class timetable',
        'course calendar',
        'semester planning',
        'university schedule',
        'class planner',
        'course schedule',
        'academic calendar',
        'time management',
        'course conflict checker',
        'schedule builder',
        'semester timetable',
    ],
    openGraph: {
        title: 'My Schedule - Plan Your Semester | Ateneo Enlistment Helper',
        description:
            "View and manage your selected courses in an organized schedule format. Build your ideal timetable and ensure your classes don't conflict.",
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Ateneo Course Schedule Planning Interface',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My Schedule - Plan Your Semester | Ateneo Enlistment Helper',
        description:
            "View and manage your selected courses in an organized schedule format. Build your ideal timetable and ensure your classes don't conflict.",
        images: ['/og-image.jpg'],
    },
    alternates: {
        canonical: '/schedule',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ScheduleLayout({ children }) {
    return <>{children}</>;
}
