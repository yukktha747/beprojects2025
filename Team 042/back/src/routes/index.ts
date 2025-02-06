import express, { Request, Response } from 'express';
import routerV1 from './v1/index';

const router = express.Router();

// Using the v1 router for API routes
router.use('/api/v1', routerV1);

// Health check route
//@ts-ignore
router.get('/', (req: Request, res: Response) => {
  return res.status(200).send({
    uptime: process.uptime(),
    message: 'SyncZero API health check :: GOOD',
    timestamp: Date.now(),
  });
});

export default router;
