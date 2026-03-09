import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware.js';
import { broadcastResume, getCompanies, seedCompanies } from '../controllers/broadcast.controller.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF resumes are supported.'));
    }
});

router.get('/companies', getCompanies);
router.post('/seed', protect, seedCompanies);
router.post('/resume', protect, upload.single('resumeDocument'), broadcastResume);

export default router;
