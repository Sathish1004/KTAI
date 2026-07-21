# KT - AI Resume Analyzer

A full-stack application featuring a React frontend (Vite) and an Express backend for an AI-powered resume processing system.

## Project Structure

```
KT
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── layouts
│   │   ├── pages
│   │   ├── hooks
│   │   ├── context
│   │   ├── services
│   │   ├── utils
│   │   ├── routes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── ai
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── prompts
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── utils
│   ├── vector
│   ├── docs
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## Getting Started

### Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

### Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file with your database credentials and Gemini API key.
4. Run in development mode:
   ```bash
   npm run dev
   ```
