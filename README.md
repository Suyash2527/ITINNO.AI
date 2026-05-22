<div align="center">
  <h1>ITINNO.AI</h1>
  <p>A beautiful AI-powered travel planner that converts inspiration into personalized journeys.</p>
</div>

## About

ITINNO.AI is an advanced travel discovery and itinerary builder for explorers who want meaningful trips with less friction. It combines smart itinerary generation, user-saved plans, community sharing, and location-aware map displays to help travelers plan better trips faster.

## Features

- AI-guided itinerary creation and planning
- Firebase authentication and secure user data storage
- Interactive itinerary dashboard and saved plans
- Community feed for sharing travel ideas and experiences
- Responsive layout for desktop and mobile screens
- Gemini AI integration for smart travel recommendations

## Tech Stack

- React + TypeScript
- Vite
- Firebase (Authentication, Firestore)
- Gemini AI service integration
- CSS for expressive user experience

## Quick Start

1. Clone the repository
2. Install dependencies:
   `npm install`
3. Configure Firebase in `src/firebase.ts`
4. Create a `.env.local` file and add:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Launch the app:
   `npm run dev`

## Project Structure

- `src/components` — shared UI pieces and feature modules
- `src/pages` — main application pages like Home, Dashboard, and Community
- `src/services` — Firebase and Gemini API integration logic
- `src/lib` — helper utilities and shared helpers

## Notes

This repository is designed to be a complete travel planning web app. Customize the Firebase config and Gemini API key to run the project locally and explore the full experience.

## License

MIT License
