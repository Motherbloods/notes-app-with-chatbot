# Notes App with Chatbot

A full-stack application designed for efficient note-taking with integrated AI chatbot capabilities for enhanced productivity and information retrieval. This project combines a robust Node.js backend with a dynamic React frontend, offering a seamless user experience for managing notes and interacting with an intelligent assistant.

## Features

### Notes Management
*   **Create, Read, Update, Delete (CRUD):** Comprehensive functionality for managing your notes.
*   **Rich Content Display:** Support for formatted content, including code blocks with syntax highlighting.
*   **Archiving:** Organize your notes by archiving older or less relevant entries.

### AI Chatbot Integration
*   **Intelligent Assistant:** Interact with a chatbot to get insights, summaries, or answers related to your notes.
*   **Contextual Conversations:** The chatbot leverages your notes for more relevant and personalized responses.

### Search & Analysis
*   **Full-text Search:** Quickly find specific notes or content using powerful search capabilities.
*   **Content Analysis:** Backend services for processing and analyzing note content, potentially for embedding and advanced search.

### User Interface
*   **Responsive Design:** A modern and intuitive user interface built with React and Tailwind CSS.
*   **Theme Toggle:** Switch between light and dark modes for a personalized viewing experience.
*   **Modals & Notifications:** Interactive modals for confirmations and edits, with toast notifications for user feedback.

## Technologies Used

### Backend (notes-be)
*   **Node.js & Express.js:** For building a fast and scalable RESTful API.
*   **MongoDB (via Mongoose):** A NoSQL database for flexible data storage.
*   **CORS, Helmet, Body-parser:** Essential middleware for security, cross-origin resource sharing, and request body parsing.
*   **Dotenv:** For managing environment variables securely.

### Frontend (notes-fe)
*   **React.js:** A declarative, component-based JavaScript library for building user interfaces.
*   **Vite:** A next-generation frontend tooling that provides an extremely fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **React Router DOM:** For declarative routing in React applications.
*   **Framer Motion:** A production-ready motion library for React to power animations.
*   **Lucide React:** A collection of beautiful and customizable SVG icons.
*   **React Hot Toast:** For elegant and accessible toast notifications.
*   **React Markdown, Remark GFM, React Syntax Highlighter:** For rendering and highlighting markdown content, including GitHub Flavored Markdown and code blocks.
*   **Axios:** A promise-based HTTP client for making API requests.

## Installation

To set up and run this project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/notes-app-with-chatbot.git
cd notes-app-with-chatbot
```

### 2. Backend Setup

Navigate to the `notes-be` directory, install dependencies, and start the server.

```bash
cd notes-be
npm install
```

Create a `.env` file in the `notes-be` directory and add your MongoDB connection string:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000 # Or any other port you prefer
```

Start the backend server:

```bash
node app.js
```

The backend server will typically run on `http://localhost:5000` (or your specified PORT).

### 3. Frontend Setup

Open a new terminal, navigate to the `notes-fe` directory, install dependencies, and start the development server.

```bash
cd ../notes-fe
npm install
npm run dev
```

The frontend development server will typically run on `http://localhost:5173` (or another port if 5173 is in use).

## Usage

Once both the backend and frontend servers are running:

1.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  Start creating, editing, and managing your notes.
3.  Explore the chatbot functionality to interact with your notes.
4.  Utilize the search feature to quickly find information.

## API Endpoints (Brief Overview)

The backend exposes various API endpoints for managing notes, chatbot interactions, search, and content analysis.

*   `/api/notes`: CRUD operations for notes.
*   `/api/chatbot`: Endpoints for chatbot interactions.
*   `/api/search`: Search functionality.
*   `/api/analyzing`: Content analysis services.
*   `/api/embedding`: Content embedding services.

## Folder Structure

```
notes-app-with-chatbot/
├───README.md
├───.git/
├───.github/
├───notes-be/                 # Backend (Node.js, Express, MongoDB)
│   ├───controllers/          # Handles incoming requests and responses
│   ├───models/               # Defines Mongoose schemas for data
│   ├───routes/               # Defines API routes
│   ├───services/             # Contains business logic
│   ├───utils/                # Utility functions (DB connection, etc.)
│   └───app.js                # Main backend application file
├───notes-fe/                 # Frontend (React, Vite, Tailwind CSS)
│   ├───public/               # Static assets
│   ├───src/
│   │   ├───api/              # Frontend API service calls
│   │   ├───assets/           # Static assets (images, icons)
│   │   ├───components/       # Reusable UI components
│   │   ├───config/           # Configuration files
│   │   ├───context/          # React Context for global state
│   │   ├───hooks/            # Custom React hooks
│   │   ├───layout/           # Layout components
│   │   ├───pages/            # Page-level components
│   │   ├───services/         # Frontend services
│   │   ├───App.jsx           # Main React application component
│   │   ├───index.css         # Global styles
│   │   └───main.jsx          # Entry point for React app
│   └───index.html            # Main HTML file
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
