import { Router } from 'express';
import { authMiddleware, permissionMiddleware } from '../../middleware/auth';

const router = Router();

// GET all users
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: 'TODO: Implement GET all users' });
});

// GET user by id
router.get('/:id', authMiddleware, async (req, res) => {
  res.json({ message: 'TODO: Implement GET user by id' });
});

// POST create user
router.post('/', authMiddleware, async (req, res) => {
  res.json({ message: 'TODO: Implement POST create user' });
});

// PATCH update user
router.patch('/:id', authMiddleware, async (req, res) => {
  res.json({ message: 'TODO: Implement PATCH update user' });
});

// DELETE user
router.delete('/:id', authMiddleware, async (req, res) => {
  res.json({ message: 'TODO: Implement DELETE user' });
});

export default router;
