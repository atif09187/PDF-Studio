import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const serveDownloadsPlugin = () => {
  const handler = (req: any, res: any, next: any) => {
    const cleanUrl = req.url ? req.url.split('?')[0] : '';
    if (cleanUrl === '/PDF_Studio_Release.apk' || cleanUrl === '/downloads/PDF_Studio_Release.apk') {
      const filePath = path.resolve(process.cwd(), 'release/PDF_Studio_Release.apk');
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Length': stat.size,
          'Content-Disposition': 'attachment; filename="PDF_Studio_Release.apk"',
        });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return;
      }
    }
    if (cleanUrl === '/PDF_Studio_Project_Source.zip' || cleanUrl === '/downloads/PDF_Studio_Project_Source.zip') {
      const filePath = path.resolve(process.cwd(), 'release/PDF_Studio_Project_Source.zip');
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Length': stat.size,
          'Content-Disposition': 'attachment; filename="PDF_Studio_Project_Source.zip"',
        });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return;
      }
    }
    next();
  };

  return {
    name: 'serve-downloads',
    configureServer(server: any) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handler);
    },
  };
};

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), serveDownloadsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
