# CMS Content Audit Dashboard

A full-stack CMS content quality dashboard built as a public demonstration of modern web development, API integration, accessibility, and content-management tooling.

This project uses entirely fictional data and contains no proprietary or employer-owned source code.

## Features

- CMS content inventory
- Search and server-side filtering
- Publishing status tracking
- SEO quality scoring
- Accessibility issue tracking
- Broken-link detection metrics
- Content-type filtering
- Responsive dashboard interface
- REST API
- Accessible semantic UI

## Technology

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express
- TypeScript
- REST API

## Architecture

The project is split into two applications:

client/
- React + TypeScript frontend

server/
- Node.js + Express API

The frontend retrieves content inventory and summary data through REST endpoints exposed by the Express server.

## API endpoints

- GET /api/health
- GET /api/content
- GET /api/content?search=platform
- GET /api/content?status=Published
- GET /api/content?type=Landing%20Page
- GET /api/summary

## Running locally

Install dependencies:

npm install
npm install --prefix client
npm install --prefix server

Start both applications:

npm run dev

Frontend:

http://localhost:5173

API:

http://localhost:4000

## Purpose

This project was created as a standalone portfolio demonstration of techniques I use when building production CMS and web applications, including:

- React component architecture
- TypeScript
- Node.js APIs
- Content inventory management
- Search and filtering
- CMS-oriented data modeling
- Responsive interfaces
- Accessibility-conscious development
- Quality and analytics dashboards

All organizations, content records, metrics, and identifiers in this repository are fictional.

## Author

Patrick Brady

Senior HubSpot / Full-Stack Developer

## Screenshot

![CMS Content Audit Dashboard](Dashboardscreenshot.png)
