# ShatterQuiz

Realtime multiplayer quiz game built with React, Vite, Express, and Socket.IO.

## Run locally

Prerequisites: Node.js 20+

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npm run dev
```

3. Open the app

http://localhost:3000

No API key is required for the current game flow.

## Deploy (Render)

This project includes a Render blueprint at `render.yaml`.

1. Push this code to your GitHub repository.
2. In Render, click New + -> Blueprint.
3. Select your repository.
4. Render will auto-detect `render.yaml` and deploy.

The deployed app exposes a health endpoint at `/api/health`.

## Manual deploy settings (if needed)

- Build Command: `npm install && npm run build`
- Start Command: `NODE_ENV=production npm start`
