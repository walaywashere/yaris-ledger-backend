import { Router } from 'express';

import {
  archiveCustomer,
  getCustomer,
  getCustomers,
  patchCustomer,
  postCustomer,
  restoreCustomer
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/auth.js';

export const customersRouter = Router();

customersRouter.use(requireAuth);

customersRouter.get('/', getCustomers);
customersRouter.get('/:id', getCustomer);
customersRouter.post('/', postCustomer);
customersRouter.patch('/:id', patchCustomer);
customersRouter.post('/:id/archive', archiveCustomer);
customersRouter.post('/:id/restore', restoreCustomer);