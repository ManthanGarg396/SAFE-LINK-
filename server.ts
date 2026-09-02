import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/server/apiHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// API routes
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    const handled = await handleApiRequest(req, res, req.url.split('?')[0]);
    if (handled) return;
  }
  next();
});

// Serve static build in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SAFE-LINK AI server listening on http://0.0.0.0:${port}`);
});
