import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quin69 Playlist Tracker",
  description: "Track Twitch.tv/Quin69's chat-requested songs in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

