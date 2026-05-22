import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        creme: "#F5F1EA",
        marfim: "#FFFDF8",
        tinta: "#1A1A1A",
        terracota: "#C8472B",
        "terracota-claro": "#F5D6CD",
        "cinza-tinta": "#555048",
        "cinza-poeira": "#8B8478",
        linha: "#D9D3C5",
        "linha-suave": "#EBE6DA",
        // funcionais
        roteiro: "#8A5A00",
        "roteiro-bg": "#FDF3DC",
        gravado: "#2C5E7A",
        "gravado-bg": "#D6EAF3",
        editado: "#B8862C",
        "editado-bg": "#F7EDDA",
        publicado: "#4A6B3A",
        "publicado-bg": "#E0EDDA",
        "em-fila": "#B8862C",
        "em-fila-bg": "#F7EDDA",
        concluido: "#4A6B3A",
        "concluido-bg": "#E0EDDA",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter Tight", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
