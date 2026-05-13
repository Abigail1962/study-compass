# Study Compass

Study Compass is a full-stack web application for comparing universities and organizing application-related information. The project was built to practice modern web development with React, TypeScript, Supabase, and PostgreSQL.

## Features

* Compare universities by tuition, rankings, region, and academic information
* User authentication with Supabase Auth
* Store and manage university/application-related data with PostgreSQL
* Responsive UI built with React and Tailwind CSS
* Client-side routing with TanStack Router
* Server-state management and caching with React Query

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* TanStack Router
* React Query

### Backend & Database

* Supabase
* PostgreSQL

### Tools

* Vite
* Git
* ESLint

## Project Structure

```text
study-compass/
├── src/                 # Main application source code
├── assets/              # Images and screenshots
├── dist/                # Production build output
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── supabase_schema.sql
```

## Screenshots

### Home Page

![Home](home.png)

### University Comparison

![Compare](school-compare.png)

### Login Page

![Login](login.png)

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Abigail1962/study-compass.git
cd study-compass
```

### Install dependencies

```bash
npm install
```

### Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start the development server

```bash
npm run dev
```

The application should now be running locally.

## Deployment

This project can be deployed using platforms such as:

* Vercel
* Netlify
* Cloudflare Pages

## What I Learned

Through this project, I practiced:

* Building full-stack applications with React and Supabase
* Managing authentication and database integration
* Working with client-side routing and server-state caching
* Designing responsive user interfaces with Tailwind CSS
* Organizing larger frontend project structures

## Future Improvements

* Add search and filtering features
* Improve mobile responsiveness
* Add more university datasets and analytics
* Improve accessibility and UI polish

## Notes

This is a personal student project built for learning and experimentation.
