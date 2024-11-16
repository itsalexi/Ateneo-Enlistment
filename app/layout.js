import localFont from 'next/font/local';
import './globals.css';
import { FavoriteCoursesProvider } from '@/lib/context';
import Nav from '@/components/Nav';

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
  title: 'Ateneo Enlistment Helper',
  description:
    'An easy way to find available classes and build your schedule in Ateneo. Browse courses, apply filters, and create your ideal timetable with the Ateneo Enlistment Helper!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FavoriteCoursesProvider>
          <Nav />
          {children}
        </FavoriteCoursesProvider>
      </body>
    </html>
  );
}
