# Quin69 Playlist Tracker

Track Twitch.tv/Quin69's chat-requested songs in real-time.

🔗 **Live:** https://mihaissh.github.io/quin69-playlist-tracker/

## Features

- 🎵 Auto-refreshes every 15 seconds
- 🔗 Search songs on Spotify & YouTube
- 📱 Responsive design
- ⚡ Fast & lightweight

## How It Works

Fetches Sheepfarmer's chat logs to display currently playing and recently played songs. Accuracy depends on Quin69 using the chat playlist. If a song seems wrong, type `!song` in chat to update.

## Tech Stack

Next.js 14 • TypeScript • Tailwind CSS

## Development

**Requirements:** Node.js 18+

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Spotify API (for album artwork):**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your **Client ID** and **Client Secret**
   - Create a `.env.local` file in the root directory:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```

3. **Run dev server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view.
