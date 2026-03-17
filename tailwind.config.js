/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          // Bangladesh green — primary
          primary:       "#006A4E",
          "primary-light": "#007D5C",
          "primary-dark":  "#005540",
          // Saffron/marigold — CTA
          cta:           "#E07B2A",
          "cta-hover":   "#C96A1A",
          // Warm cream surfaces
          surface:       "#FFFDF7",
          card:          "#FFFFFF",
          // Typography
          text:          "#1C1917",
          muted:         "#78716C",
          // Warm borders
          border:        "#E8DDD0",
          "border-dark": "#D4C4B0",
        },
      },
      fontFamily: {
        heading: ['"Baloo Da 2"', 'sans-serif'],
        body:    ['"Hind Siliguri"', 'sans-serif'],
        sans:    ['"Hind Siliguri"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card:       "0 1px 4px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)",
        "card-hover":"0 8px 28px -4px rgba(0,106,78,0.14), 0 4px 10px -4px rgba(0,106,78,0.08)",
      },
    },
  },
  plugins: [],
}
