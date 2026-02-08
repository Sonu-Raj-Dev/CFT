import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all role-permissions' }));
router.get('/:roleId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET permissions by role' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST assign permissions to role' }));
router.patch('/:roleId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update role permissions' }));
router.delete('/:roleId/:permissionId', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE permission from role' }));

export default router;
