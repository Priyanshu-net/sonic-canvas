import { createSonicCanvasServer } from './serverFactory.js';

const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

const { listen } = createSonicCanvasServer({ 
  port: PORT, 
  corsOrigin: CORS_ORIGINS 
});

listen();
