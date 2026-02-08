import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all statuses' }));
router.get('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET status by id' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST create status' }));
router.patch('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update status' }));
router.delete('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE status' }));

export default router;
