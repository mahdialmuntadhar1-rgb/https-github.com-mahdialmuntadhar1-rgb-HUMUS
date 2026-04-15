import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API Route to save hero content
  app.post('/api/build-mode/save-hero', async (req, res) => {
    try {
      const { slides } = req.body;
      
      if (!slides || !Array.isArray(slides)) {
        return res.status(400).json({ error: 'Invalid slides data' });
      }

      const heroDir = path.join(process.cwd(), 'public', 'hero');
      if (!fs.existsSync(heroDir)) {
        fs.mkdirSync(heroDir, { recursive: true });
      }

      // Process images and update paths
      const processedSlides = slides.map((slide: any, index: number) => {
        if (slide.image && slide.image.startsWith('data:image')) {
          const base64Data = slide.image.replace(/^data:image\/\w+;base64,/, '');
          const extension = slide.image.split(';')[0].split('/')[1];
          const fileName = `hero-${index + 1}-${Date.now()}.${extension}`;
          const filePath = path.join(heroDir, fileName);
          
          fs.writeFileSync(filePath, base64Data, 'base64');
          return { ...slide, image: `/hero/${fileName}` };
        }
        return slide;
      });

      // Write to src/data/heroContent.ts
      const contentFile = path.join(process.cwd(), 'src', 'data', 'heroContent.ts');
      const fileContent = `import { HeroSlide } from '@/types/buildMode';\n\nexport const heroContent: HeroSlide[] = ${JSON.stringify(processedSlides, null, 2)};\n`;
      
      fs.writeFileSync(contentFile, fileContent);

      res.json({ success: true, slides: processedSlides });
    } catch (error) {
      console.error('Error saving hero content:', error);
      res.status(500).json({ error: 'Failed to save hero content' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicitly serve manifest with correct headers to avoid 401
    app.get('/manifest.webmanifest', (req, res) => {
      const manifestPath = path.join(distPath, 'manifest.webmanifest');
      if (fs.existsSync(manifestPath)) {
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.sendFile(manifestPath);
      }
      // Fallback to public if not in dist
      const publicManifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
      if (fs.existsSync(publicManifestPath)) {
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.sendFile(publicManifestPath);
      }
      res.status(404).send('Not found');
    });

    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
