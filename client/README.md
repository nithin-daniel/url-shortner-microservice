# URL Shortener - Client

A modern, minimal React application for the URL Shortener microservice built with Vite, React, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Login and Register pages with JWT authentication
- 🎨 **Modern UI**: Clean, minimal design using Tailwind CSS
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🔗 **URL Management**: Create, view, and delete shortened URLs
- 📊 **Analytics**: Track click counts for each URL
- 🎯 **Protected Routes**: Dashboard accessible only to authenticated users

## Pages

### Home (`/`)
- Landing page with hero section
- Feature highlights
- Call-to-action buttons

### Login (`/login`)
- Email and password authentication
- Gradient background with modern form design
- Link to registration page

### Register (`/register`)
- User registration with username, email, and password
- Password confirmation validation
- Link to login page

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- URL shortening form
- List of user's shortened URLs
- Click tracking
- Copy to clipboard functionality
- Delete URLs

## Tech Stack

- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and set `VITE_API_BASE_URL` to your backend URL (default: http://localhost)

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   └── Dashboard.jsx     # Main dashboard
│   ├── components/           # Reusable components (empty for now)
│   ├── utils/
│   │   └── api.js           # Axios configuration
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind imports
├── public/                  # Static assets
└── package.json
```

## API Integration

The app integrates with the backend microservices:

- **Auth Service**: `/auth/login`, `/auth/register`
- **URL Service**: `/url/shorten`, `/url/urls`, `/url/:id`

API calls are made using Axios with automatic JWT token injection from localStorage.

## Design Philosophy

- **Minimal**: Clean, uncluttered interface
- **Modern**: Contemporary gradients and shadows
- **Accessible**: Clear labels and focus states
- **Responsive**: Mobile-first approach with Tailwind breakpoints
