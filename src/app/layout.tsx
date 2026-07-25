import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const basePath = process.env.NODE_ENV === "production" ? "/quin69-playlist-tracker" : "";

export const metadata: Metadata = {
  title: "Quin69 Playlist Tracker",
  description: "Track Twitch.tv/Quin69's chat-requested songs in real-time",
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0b0908]">
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://decapi.me" />
        <link rel="preconnect" href="https://logs.ivr.fi" />
        <link rel="dns-prefetch" href="https://open.spotify.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className={`${inter.className} antialiased font-sans bg-[#0b0908] text-white min-h-screen relative`}>
        {/* Warm dark orange radial glow background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Top radial orange spotlight */}
          <div 
            className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-45 blur-[140px]"
            style={{
              background: 'radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, rgba(194, 65, 12, 0.12) 40%, rgba(124, 45, 18, 0.03) 70%, transparent 100%)'
            }}
          />
          {/* Subtle warm inner core glow */}
          <div 
            className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-35 blur-[90px]"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(217, 119, 6, 0.06) 65%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

