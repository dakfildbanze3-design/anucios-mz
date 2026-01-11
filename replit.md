# Anúncios MZ

## Overview
A React-based Progressive Web App (PWA) for buying and selling vehicles, real estate, and electronics in Mozambique. Built with Vite, TypeScript, and Supabase.

## Project Structure
- `/screens/` - React screen components (HomeScreen, AdDetailsScreen, etc.)
- `/components/` - Reusable React components
- `/lib/` - Utility libraries (Supabase client)
- `/public/` - Static assets, PWA icons, and service worker

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Backend**: Supabase (database & auth)
- **PWA**: vite-plugin-pwa with service worker

## Development
- Run `npm run dev` to start the development server on port 5000
- Run `npm run build` to create production build
- Run `npm run preview` to preview production build

## Configuration
- Vite configured to run on port 5000 with all hosts allowed for Replit proxy
- PWA manifest and service worker included for offline support
