import { Router, Request, Response } from 'express';
import { getNewCsrfToken } from '../middleware/csrf';

export const csrfRoutes = Router();

csrfRoutes.get('/token', async (req: Request, res: Response) => {
  try {
    const token = await getNewCsrfToken();
    res.json({ csrfToken: token });
  } catch (e) {
    res.status(503).json({ error: 'CSRF token unavailable' });
  }
});
