import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => ({
  // Web deploy: https://man1banggai.sch.id/sim_akad/
  // Android (Capacitor): gunakan base relatif supaya asset bisa dibaca dari file://android_asset/
  // XAMPP (lokal): pakai base relatif supaya bisa dibuka dari http://localhost/SIM_AKAD/dist/
  base: mode === 'capacitor' || mode === 'xampp' ? './' : '/sim_akad/',
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
    {
      name: 'redirect-trailing-slash-for-base',
      configureServer(server) {
        const base = '/sim_akad/';
        const noSlash = base.endsWith('/') ? base.slice(0, -1) : base;

        const handler = (req: any, res: any, next: any) => {
          const url = req?.url || '';
          if (url === noSlash || url.startsWith(noSlash + '?')) {
            const qs = url.includes('?') ? url.slice(url.indexOf('?')) : '';
            res.statusCode = 302;
            res.setHeader('Location', base + qs);
            res.end();
            return;
          }
          next();
        };

        // Vite menambahkan middleware `base` yang bisa mengakhiri response lebih awal
        // (menampilkan halaman "did you mean .../?"). Supaya redirect ini pasti jalan,
        // kita sisipkan di paling awal stack connect.
        const middlewares: any = server.middlewares as any;
        if (Array.isArray(middlewares?.stack)) {
          middlewares.stack.unshift({ route: '', handle: handler });
        } else {
          server.middlewares.use(handler);
        }
      },
    },
  ],
}));
