# Ateneo Enlistment System

A Next.js application for managing and viewing Ateneo course offerings and schedules.

## Features

- **Course Offerings**: View and filter course offerings by program, department, and various criteria
- **Schedule Management**: Create and manage personal course schedules
- **Real-time Updates**: Automatically updated course data from AISIS
- **Semester Information**: Dynamic semester information via API

## API Endpoints

- `GET /api/semester` - Returns current semester information (period, semester string, last updated)
- `GET /api/schedule` - Retrieves schedule data using prefill tokens
- `GET /api/offerings` - Returns course offerings data
- `GET /api/programs` - Returns program information
- `GET /api/calculator` - Returns calculator-related data

For detailed API documentation, see [docs/api.md](docs/api.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
