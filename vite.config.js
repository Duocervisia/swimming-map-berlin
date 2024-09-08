import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.VITE_WEBSITE_TYPE': JSON.stringify(process.env.VITE_WEBSITE_TYPE || 'example'),
  },
});
