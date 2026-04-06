import { Router } from 'express';
import {
  getSummary,
  getMonthlyTrends,
  getCategoryTotals,
  getRecentTransactions,
} from '../controllers/dashboardController.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/rbac.js';

const router = Router();

router.use(verifyToken);

router.get("/recent",getRecentTransactions);


//analytics
router.get("/summary",requireRole("analyst"),getSummary);
router.get("/trends",requireRole("analyst"),getMonthlyTrends);
router.get("/categories",requireRole("analyst"),getCategoryTotals);

export default router;


