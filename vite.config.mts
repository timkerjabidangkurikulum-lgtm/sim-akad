import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => ({
  // Web deploy: https://man1banggai.sch.id/sim_akad/
  // Android (Capacitor): gunakan base relatif supaya asset bisa dibaca dari file://android_asset/
  // XAMPP (lokal): pakai base relatif supaya bisa dibuka dari http://localhost/SIM_AKAD/dist/
  base: '/',
  server: {
    proxy: {
      // Dev only: forward PHP API requests to Apache (XAMPP)
      '/sim_akad/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sim_akad\//, '/SIM_AKAD/'),
      },
    },
  },
  plugins: [
    react(),
  ],
}));
