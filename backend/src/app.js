import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const openapiPath = join(__dirname, '..', 'openapi.yaml');
const swaggerDocument = yaml.load(readFileSync(openapiPath, 'utf8'));

const app = express();

app.use(cors());
app.use(express.json());

// Documentación interactiva en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);
app.use(errorHandler);

export default app;
