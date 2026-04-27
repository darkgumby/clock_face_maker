import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from 'vite-plugin-checker';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/clock_face_maker/" : "/",
  plugins: [
    react(),
    checker({ typescript: true }) // Enable TypeScript checking
  ],
});
