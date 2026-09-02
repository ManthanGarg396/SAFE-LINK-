import { IncomingMessage, ServerResponse } from 'http';
import {
  analyzeEmergency,
  analyzeHazard,
  translateWarningSign,
  chatSafety,
} from './geminiService.ts';

// Helper to parse JSON body from incoming HTTP request
export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // 10MB limit for image uploads
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => reject(err));
  });
}

export function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Router for server middleware
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: string
): Promise<boolean> {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  if (url === '/api/analyze-emergency' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await analyzeEmergency(body);
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('API Error in analyze-emergency:', err);
      sendJson(res, 500, { error: err.message || 'Emergency analysis failed' });
    }
    return true;
  }

  if (url === '/api/analyze-hazard' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await analyzeHazard(body);
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('API Error in analyze-hazard:', err);
      sendJson(res, 500, { error: err.message || 'Hazard analysis failed' });
    }
    return true;
  }

  if (url === '/api/translate-warning' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await translateWarningSign(body);
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('API Error in translate-warning:', err);
      sendJson(res, 500, { error: err.message || 'Warning translation failed' });
    }
    return true;
  }

  if (url === '/api/safety-chat' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await chatSafety(body.messages || [], body.language || 'English');
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('API Error in safety-chat:', err);
      sendJson(res, 500, { error: err.message || 'Chat failed' });
    }
    return true;
  }

  return false;
}
