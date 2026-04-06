import { Router } from 'express';
import {
    getRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
} from '../controllers/recordController.js';
import verifyToken from '../middleware/auth.js';
import requireRole from '../middleware/rbac.js';

const router = Router();

// All record routes require login

router.use(verifyToken);

//allowed for all roles
router.get("/",getRecords);
router.get("/:id",getRecordById);

//MARK: admin only
router.post("/",requireRole("admin"),createRecord);
router.patch("/:id",requireRole("admin"),updateRecord);
router.delete("/:id",requireRole("admin"),deleteRecord);

export default router;

