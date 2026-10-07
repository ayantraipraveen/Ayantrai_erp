import { Router } from 'express';
import healthRoutes from './health/health.routes';
import templateRoutes from './templates/template.routes';
import watermarkRoutes from './watermarks/watermark.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/templates', templateRoutes);
router.use('/watermarks', watermarkRoutes);

export default router;
