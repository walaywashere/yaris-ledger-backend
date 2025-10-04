import { Router } from 'express';

import {
  getSale,
  getSales,
  patchSale,
  postSale,
  removeSale
} from '../controllers/saleController.js';
import { requireAuth } from '../middleware/auth.js';

export const salesRouter = Router();

salesRouter.use(requireAuth);

salesRouter.get('/', getSales);
salesRouter.get('/:id', getSale);
salesRouter.post('/', postSale);
salesRouter.patch('/:id', patchSale);
salesRouter.delete('/:id', removeSale);