# Profi Bolus Calc

A React + Vite + TypeScript web application for calculating insulin dosage based on carbohydrates, fat/protein/calories, and blood glucose, including FPE calculation and trend arrow logic. Uses Bootstrap for UI and localStorage for persistence.

## Features

- Calculate insulin dose from carbs, fat/protein/calories, and current blood glucose
- FPE (Fett-Protein-Einheiten) calculation according to medical rules
- Trend arrow recommendations
- Save administered insulin doses and show remaining active insulin on reload
- User settings stored in localStorage

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

## Usage

- Enter meal data and blood glucose values in the form
- Adjust settings as needed
- Save insulin doses to track active insulin

## License

MIT
