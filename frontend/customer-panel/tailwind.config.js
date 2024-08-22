/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                whiteText: "#fff",
                darkText: "#000000",
                lightText: "#9b9b9b",
                greenText: "#1d8221",
                redText: "#E02B2B ",
                skyText: "#32BDE8",
            },
            flex: {
                full: "0 0 100%",
            },
            animation: {
                scroll: "scroll 30s linear infinite",
            },
            keyframes: {
                scroll: {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/aspect-ratio"),
    ],
};
