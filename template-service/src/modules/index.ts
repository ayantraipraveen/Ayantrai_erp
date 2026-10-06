import { Router } from 'express';
import healthRoutes from './health/health.routes';
import templateRoutes from './templates/template.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/templates', templateRoutes);

export default router;
