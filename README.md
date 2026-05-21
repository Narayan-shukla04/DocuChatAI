# DocuChat AI

DocuChat AI is a modern SaaS application that allows users to upload documents (PDF, DOCX, TXT, Excel, PPTX) and interact with them using a Retrieval-Augmented Generation (RAG) pipeline powered by LangChain and Google Gemini.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, Redux Toolkit, React Router DOM
- **Backend:** Node.js, Express, MongoDB
- **AI/RAG:** LangChain, Google Generative AI (Gemini), MemoryVectorStore

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/docuchat
JWT_SECRET=supersecretjwtkey2026
GEMINI_API_KEY=your_gemini_api_key_here
```
Run the backend server:
```bash
node index.js
```

### 2. Frontend Setup
```bash
cd client
npm install
```
Run the frontend development server:
```bash
npm run dev
```

## Features
- **Authentication:** JWT-based user login and registration.
- **Upload System:** File validation and secure upload using Multer.
- **RAG Pipeline:** Document chunking, text splitting, and vector embedding generation using Gemini.
- **Chat Interface:** Markdown support, syntax highlighting, and conversational UI.
- **Modern Design:** Dark theme, glassmorphism, and neon accents.
