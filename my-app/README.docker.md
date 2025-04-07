# Docker PostgreSQL Setup for Local Development

This project uses Docker to provide a PostgreSQL database for local development.

## Prerequisites

- Docker and Docker Compose installed on your machine

## Setup Instructions

1. Create a `.env` file in the root directory with the following environment variables:

```bash
# PostgreSQL environment variables - set these before running docker-compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=hackathon_vote
```

**Important:** The `.env` file contains sensitive information and is not committed to the repository. You must create this file locally before starting the Docker containers.

2. Start the PostgreSQL container:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance on port 5436.

3. Update your `.env.local` file to use the Docker PostgreSQL instance:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/hackathon_vote?schema=public"
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

5. Start the Next.js development server:

```bash
npm run dev
```

## Stopping the Database

To stop the PostgreSQL container:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```
