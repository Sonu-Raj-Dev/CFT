import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all permissions' }));
router.get('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET permission by id' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST create permission' }));
router.patch('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update permission' }));
router.delete('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE permission' }));

export default router;
