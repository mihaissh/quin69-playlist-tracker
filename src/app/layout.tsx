import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quin69 Playlist Tracker",
  description: "Track Twitch.tv/Quin69's chat-requested songs in real-time",
  icons: {
    icon: `${process.env.NODE_ENV === 'production' ? '/quin69-playlist-tracker' : ''}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://decapi.me" />
        <link rel="preconnect" href="https://logs.ivr.fi" />
        <link rel="dns-prefetch" href="https://open.spotify.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

