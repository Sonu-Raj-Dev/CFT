import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET all customers' }));
router.get('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement GET customer by id' }));
router.post('/', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement POST create customer' }));
router.patch('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement PATCH update customer' }));
router.delete('/:id', authMiddleware, (req, res) => res.json({ message: 'TODO: Implement DELETE customer' }));

export default router;
