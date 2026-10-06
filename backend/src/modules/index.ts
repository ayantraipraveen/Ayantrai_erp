import { Router } from 'express';
import healthRoutes from './health/health.routes';
import authRoutes from './auth/auth.routes';

const router = Router();

// Mount feature modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Additional feature modules will be mounted here as we build them step-by-step:
// router.use('/templates', templateRoutes);
// router.use('/sections', sectionRoutes);
// router.use('/telemetry', telemetryRoutes);

export default router;
