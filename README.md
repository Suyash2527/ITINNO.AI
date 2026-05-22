# ITINNO.AI

> AI-powered travel itinerary generation and community-driven tourism platform.

![GitHub stars](https://img.shields.io/github/stars/Suyash2527/ITINNO.AI?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/Suyash2527/ITINNO.AI?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/Suyash2527/ITINNO.AI?style=for-the-badge&logo=github) ![Last commit](https://img.shields.io/github/last-commit/Suyash2527/ITINNO.AI?style=for-the-badge&logo=github) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 📑 Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Key Dependencies](#key-dependencies)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

## 📝 Description

ITINNO.AI is a travel-planning platform designed to simplify itinerary creation through automated intelligence. By parsing user preferences, the application generates structured travel plans tailored to individual constraints and preferences. It resolves the tedious process of manual vacation planning by consolidating route optimization, localized suggestions, and community-driven insights into a single accessible interface.

## ✨ Key Features

- **🤖 Gemini AI Itinerary Generation** — Utilizes the Gemini API to analyze user preferences and automatically generate efficient, customized travel schedules.
- **🗺️ Google Maps and Places Integration** — Integrates Google Maps and Google Places APIs to pull real-world geographic data, points of interest, and route information.
- **🔥 Firebase Infrastructure and Security** — Secures community and application data using Firebase configurations and custom Firestore rules.
- **✨ Animated Tailwind Interface** — Provides a responsive user interface built with React, Vite, Tailwind CSS, and Framer Motion.

## 🎯 Use Cases

- Generating detailed daily travel schedules and location recommendations based on dynamic user input.
- Developing a secure, maps-enabled tourism web application backed by Firebase and Express.js.
- Capturing community travel feedback and experiences to refine future itinerary suggestions.

## 🛠️ Tech Stack

- 🚀 **Express.js**
- 🔥 **Firebase**
- ⚛️ **React**
- 🌬️ **Tailwind CSS**
- 📘 **TypeScript**
- ⚡ **Vite**

**Notable libraries:** Framer Motion

## ⚡ Quick Start

```bash

# 1. Clone the repository
git clone https://github.com/Suyash2527/ITINNO.AI.git

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env   # then fill in the values

# 4. Start the dev server
npm run dev
```

## 🔑 Environment Variables

The following environment variables are required (see `.env.example`):

```bash
GEMINI_API_KEY=
APP_URL=
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_PLACES_API_KEY=
```

## 📦 Key Dependencies

```
@google/genai: ^1.29.0
@tailwindcss/typography: ^0.5.19
@tailwindcss/vite: ^4.1.14
@vis.gl/react-google-maps: ^1.8.0
@vitejs/plugin-react: ^5.0.4
clsx: ^2.1.1
dotenv: ^17.2.3
express: ^4.21.2
firebase: ^12.11.0
framer-motion: ^12.38.0
leaflet: ^1.9.4
lucide-react: ^0.546.0
motion: ^12.23.24
react: ^19.0.0
react-dom: ^19.0.0
```

## 🚀 Available Scripts

- **dev** — `npm run dev`
- **build** — `npm run build`
- **preview** — `npm run preview`
- **clean** — `npm run clean`
- **lint** — `npm run lint`

## 📁 Project Structure

```
.
├── .env.example
├── firebase-applet-config.json
├── firebase-blueprint.json
├── firestore.rules
├── index.html
├── metadata.json
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   │   ├── Auth.tsx
│   │   ├── Chatbot.tsx
│   │   ├── Community.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ItineraryDisplay.tsx
│   │   ├── MapDisplay.tsx
│   │   ├── Navbar.tsx
│   │   ├── PlannerForm.tsx
│   │   ├── SavedItineraries.tsx
│   │   └── ShareItinerary.tsx
│   ├── firebase.ts
│   ├── index.css
│   ├── lib
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── CommunityFeed.tsx
│   │   ├── Dashboard.tsx
│   │   └── Home.tsx
│   ├── services
│   │   ├── dbService.ts
│   │   └── geminiService.ts
│   └── types.ts
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Development Setup

### Node.js / JavaScript
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` (or `yarn` / `pnpm install` / `bun install`)
3. Start the dev server: see the **Quick Start** above

## 👥 Contributing

Contributions are welcome! Here's the standard flow:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/Suyash2527/ITINNO.AI.git`
3. **Branch**: `git checkout -b feature/your-feature`
4. **Commit**: `git commit -m 'feat: add some feature'`
5. **Push**: `git push origin feature/your-feature`
6. **Open** a pull request

Please follow the existing code style and include tests for new behavior where applicable.

---
*This README was generated with ❤️ by [ReadmeBuddy](https://readmebuddy.com)*

