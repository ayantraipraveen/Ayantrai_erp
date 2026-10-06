import { Router } from 'express';
import healthRoutes from './health/health.routes';

const router = Router();

// Mount feature modules
router.use('/health', healthRoutes);

// Additional feature modules will be mounted here as we build them step-by-step:
// router.use('/auth', authRoutes);
// router.use('/templates', templateRoutes);
// router.use('/sections', sectionRoutes);
// router.use('/telemetry', telemetryRoutes);

export default router;
