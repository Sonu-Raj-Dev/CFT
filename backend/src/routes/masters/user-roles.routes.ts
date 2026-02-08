import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all user-roles' }));
router.get('/:userId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET roles by user' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST assign role to user' }));
router.patch('/:userId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update user roles' }));
router.delete('/:userId/:roleId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE role from user' }));

export default router;
