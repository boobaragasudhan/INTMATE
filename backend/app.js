import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './src/middlewares/errorHandler.js';
import authRoutes from './src/routes/auth.routes.js';
import broadcastRoutes from './src/routes/broadcast.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/broadcast', broadcastRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
