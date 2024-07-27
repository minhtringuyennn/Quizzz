# Quiz Platform

## Features

- Admin can log in and fetch questions.
- Clients can participate in polls and submit their answers.
- Real-time updates for poll results and quiz outcomes.
- Reconnection logic to ensure continuous connectivity.

## Technologies Used

- **Frontend:** React, TailwindCSS, Recharts, WebSockets
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB

## Installation

1. **Clone the repository:**

2. **Install dependencies:**

3. **Set up the environment variables:**

   Create a `.env` file in the root directory and add your MongoDB connection string:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

4. **Start the development server:**

## Usage

1. **Start the server:**

2. **Open the application in your browser:**

   ```bash
   http://localhost:3000
   ```

3. **Admin Login:**

   - Use the predefined admin key to log in as an admin.
   - Fetch questions and manage polls.

4. **Client Participation:**

   - Clients can join the quiz, see the questions, and participate in the polls.
   - Poll results are displayed in real-time using a bar chart.

## Database

The database is a JSON dump from a Udemy course. Ensure that you import the JSON dump into your MongoDB instance.
