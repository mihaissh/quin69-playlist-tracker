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

2. **Run dev server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view.

Album artwork is automatically fetched from iTunes API (no configuration needed).
