import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clown: {
          red: '#FF6B6B',
          orange: '#FFA06B',
          yellow: '#FFD93D',
          green: '#6BCF7F',
          blue: '#6BA3FF',
          purple: '#A06BFF',
        },
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(90deg, #FF6B6B, #FFA06B, #FFD93D, #6BCF7F, #6BA3FF, #A06BFF)',
        'rainbow-gradient-vertical': 'linear-gradient(180deg, #FF6B6B, #FFA06B, #FFD93D, #6BCF7F, #6BA3FF, #A06BFF)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'rainbow-shift': 'rainbowShift 8s ease-in-out infinite',
        'float-emote': 'floatEmote 6s ease-in-out infinite',
        'drift-across': 'driftAcross 25s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;

