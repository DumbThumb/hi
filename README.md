# Clip Rank App

This simple Express + SQLite application stores video clips with a rank indicating their importance. A small admin page lets you update each clip's rank.

## Setup

```bash
npm install
```

## Running

```bash
npm start
```

## API

* `POST /clips` – create a clip with a `title`.
* `PATCH /clips/:id/rank` – update the `rank` for a clip.
* `GET /clips` – list clips ordered by rank.

## Admin Page

Open `http://localhost:3000/admin.html` in your browser to update a clip's rank using a simple form.
