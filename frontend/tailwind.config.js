module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", side: "var(--side)", ink: "var(--ink)", mut: "var(--mut)", mut2: "var(--mut2)",
        line: "var(--line)", hov: "var(--hov)", act: "var(--act)", blue: "var(--blue)",
        danger: "var(--danger)", pop: "var(--pop)",
      },
    },
  },
  plugins: [],
};
