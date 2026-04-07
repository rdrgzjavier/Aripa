/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        "primary":                "#061542",
        "secondary":              "#6c45c0",
        "background":             "#fcf9f8",
        "on-background":          "#1b1c1c",
        "surface":                "#fcf9f8",
        "surface-bright":         "#fcf9f8",
        "on-surface":             "#1b1c1c",
        "outline-variant":        "#c6c5d0",
        "surface-container-low":  "#f6f3f2",
        "on-surface-variant":     "#45464f",
        "on-primary-container":   "#8793c7",
        "primary-container":      "#1e2b58",
        "secondary-container":    "#a67ffd",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg:      "0.25rem",
        xl:      "0.5rem",
        full:    "0.75rem"
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        brand:    ["Outfit",            "sans-serif"],
        body:     ["Inter",             "sans-serif"],
        label:    ["Inter",             "sans-serif"]
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
}
