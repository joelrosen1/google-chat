# Google Chat

A chat conversation that interacts with Google through the Serp API

## Features

- Search interface to interact with Google
- Knowledge Graph
- If there is no knowledge graph, show an AI response
- If there is no AI response, show a bulleted list of top 3 result snippets
- Image Carousel containing images pertinent to query (10 images)
- Ability to hover an image to see source, and click on it to open in a new tab
- Local map integration showing top 3 local locations pertinent to result
   - Only shows the map if the query contains a relevant location word
   - ex. where, directions, near me, etc.
- Top search results with ability to expand and collapse
   - Ability to click on a result and redirect to the website
- People Also Ask
- Related searches
- Ability to click on People Also Ask and Related Searches to start a new query
- Sources for the initial response are linked in labeled brackets
- Ability to create and delete chats
- Side menu to see select and see saved chats
- Only can search if you have a query
- shadcn/ui components to mimic StackAI design

## Tech Stack

### Frontend
- Next.js 14
- React
- TailwindCSS
- shadcn/ui

### Backend
- FastAPI
- Python
- SerpAPI integration

## Project Structure

```
google-chat/
├── frontend/                 # Next.js frontend application
│   ├── src/                 # Source files
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # Global styles and Tailwind config
│   ├── public/            # Static assets
│  
├── backend/               # FastAPI backend application
│   ├── app/              # Application source code
│   │   ├── api/         # API endpoints
│   │   └── services/    # Serp service logic
│   ├──── main.py 
└── README.md            # Project documentation
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate 
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create `.env.local` in frontend directory
   - Create `.env` in backend directory
   - Add your SerpAPI key to the backend `.env` file as `SERPAPI_KEY`
   - Add your Google Maps API key to the backend `.env` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Add your Google Maps API key to the frontend `.env.local` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Add the public API url to the frontend `.env.local` file as `NEXT_PUBLIC_API_URL` (http://localhost:8000)

4. Run the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   uvicorn app.main:app --reload
   ```