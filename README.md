# hi

## Backend service

This repository includes a simple Express backend located in `backend/`. It exposes a `POST /clips` endpoint that accepts a video file along with `eventId` and `duration` metadata. Uploaded clips are stored on disk and metadata is saved in an SQLite `clips` table.

### Running the backend

```
cd backend
npm install
npm start
```

The server starts on port 3000 by default.
