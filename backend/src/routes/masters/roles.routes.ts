import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all roles' }));
router.get('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET role by id' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST create role' }));
router.patch('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update role' }));
router.delete('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE role' }));

export default router;
