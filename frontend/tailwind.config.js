/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        pearl: "#F8FAFC",
        mint: "#17B897",
        sky: "#1E6BD6",
        ember: "#F97316",
        honey: "#D9A441",
        pollen: "#F3C969",
        propolis: "#7C5A1D",
        wax: "#F7E7B2"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 40px -30px rgba(15, 23, 42, 0.6)"
      }
    }
  },
  plugins: []
};
