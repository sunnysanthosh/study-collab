import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logError, logWarning } from '../utils/logger';
import { ErrorTracker } from '../utils/errorTracker';

export const logRoutes = Router();

// Log frontend errors
logRoutes.post('/error', async (req: Request, res: Response) => {
  try {
    const { message, stack, url, userAgent, userId, context } = req.body;

    logError(new Error(message), {
      source: 'frontend',
      stack,
      url,
      userAgent,
      userId,
      ...context,
    });

    res.status(200).json({ message: 'Error logged' });
  } catch (error) {
    logError(error as Error, { context: 'Error logging endpoint' });
    res.status(500).json({ error: 'Failed to log error' });
  }
});

// Get error statistics (admin only)
logRoutes.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = ErrorTracker.getErrorStats();
    res.json({ stats });
  } catch (error) {
    logError(error as Error, { context: 'Error stats endpoint' });
    res.status(500).json({ error: 'Failed to get error stats' });
  }
});

