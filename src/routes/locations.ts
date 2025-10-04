import { Router } from 'express';

import {
  archiveLocation,
  getLocations,
  patchLocation,
  postLocation,
  restoreLocation
} from '../controllers/locationController.js';
import { requireAuth } from '../middleware/auth.js';

export const locationsRouter = Router();

locationsRouter.use(requireAuth);

locationsRouter.get('/', getLocations);
locationsRouter.post('/', postLocation);
locationsRouter.patch('/:id', patchLocation);
locationsRouter.post('/:id/archive', archiveLocation);
locationsRouter.post('/:id/restore', restoreLocation);