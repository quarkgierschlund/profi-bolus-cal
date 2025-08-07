# Profi Bolus Calc

A React + Vite + TypeScript web application for calculating insulin dosage based on carbohydrates, fat/protein/calories, and blood glucose, including FPE calculation and trend arrow logic. Uses Bootstrap for UI and localStorage for persistence.

<img width="1590" height="1016" alt="image" src="https://github.com/user-attachments/assets/86a8404c-7dfc-4ae6-8d88-092b2953fee2" />


## Features

- Calculate insulin dose from carbs, fat/protein/calories, and current blood glucose
- FPE (Fett-Protein-Einheiten) calculation according to medical rules
- Trend arrow recommendations
- Save administered insulin doses and show remaining active insulin on reload
- User settings stored in localStorage

<img width="1568" height="598" alt="image" src="https://github.com/user-attachments/assets/eece55ff-d29c-475f-895a-baef0b16a89d" />


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
