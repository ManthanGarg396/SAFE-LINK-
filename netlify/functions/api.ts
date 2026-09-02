import serverless from 'serverless-http';
import express from 'express';
import { handleApiRequest } from '../../src/server/apiHandler.ts';

const app = express();

// Route all /api requests through the same handler we use locally
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    const handled = await handleApiRequest(req, res, req.url.split('?')[0]);
    if (handled) return;
  }
  next();
});

export const handler = serverless(app);
