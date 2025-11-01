import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quin69 Song Request Queue",
  description: "Tracking Twitch.tv/Quin69's Chat-Requested Songs",
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

