import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validate, schemas } from '../utils/validation';
import { complaintRepository } from '../repositories/complaint.repository';
import { sendSuccess, sendPaginated } from '../utils/response';
import { HttpException } from '../middleware/error-handler';

const router = Router();

// GET all complaints with pagination
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const { data, total } = await complaintRepository.findAll(page, pageSize);
  return sendPaginated(res, data, total, page, pageSize, 'Complaints fetched successfully');
});

// GET complaint by id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const complaint = await complaintRepository.findById(parseInt(id));

  if (!complaint) {
    throw new HttpException(404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
  }

  return sendSuccess(res, complaint);
});

// POST create complaint
router.post(
  '/',
  authMiddleware,
  validate(schemas.createComplaint),
  async (req: Request, res: Response) => {
    const complaint = await complaintRepository.create(req.body);
    return sendSuccess(res, complaint, 'Complaint created successfully', 201);
  },
);

// PATCH update complaint
router.patch(
  '/:id',
  authMiddleware,
  validate(schemas.updateComplaint),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const complaint = await complaintRepository.update(parseInt(id), req.body);

    if (!complaint) {
      throw new HttpException(404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    return sendSuccess(res, complaint, 'Complaint updated successfully');
  },
);

// DELETE complaint
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await complaintRepository.delete(parseInt(id));

  if (!deleted) {
    throw new HttpException(404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
  }

  return sendSuccess(res, null, 'Complaint deleted successfully');
});

// PATCH assign engineer to complaint
router.patch(
  '/:id/assign-engineer',
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { engineerId } = req.body;

    if (!engineerId) {
      throw new HttpException(400, 'Engineer ID is required', 'MISSING_ENGINEER_ID');
    }

    const complaint = await complaintRepository.assignEngineer(parseInt(id), engineerId);

    if (!complaint) {
      throw new HttpException(404, 'Complaint not found', 'COMPLAINT_NOT_FOUND');
    }

    return sendSuccess(res, complaint, 'Engineer assigned successfully');
  },
);

export default router;
