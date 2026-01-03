# SupplyVault

A comprehensive supplier compliance management platform built with Next.js, designed to help brands track and manage their suppliers' certifications and compliance documents.

## Features

- 🔐 Secure authentication with Clerk
- 📊 Supplier management and tracking
- 📜 Certification document storage and expiry tracking
- 🔔 Automated expiry alerts (90-day, 30-day, 7-day warnings)
- 👥 Team collaboration with role-based access control
- 📈 Compliance reporting and analytics
- 🌍 Multi-country supplier support

## Quick Start

**First time setup?** See the [SETUP.md](./SETUP.md) guide for detailed setup instructions.

### Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables (see [SETUP.md](./SETUP.md)):

```bash
cp .env.example .env.local
# Edit .env.local with your database and Clerk credentials
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Authentication:** [Clerk](https://clerk.com)
- **Database:** PostgreSQL with [Prisma](https://prisma.io) ORM
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Project Structure

```
supplyvault/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/                    # Utility functions and database client
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
