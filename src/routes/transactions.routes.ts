import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadCSVConfig from '../config/uploadCSV';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const uploadCSV = multer(uploadCSVConfig);

transactionsRouter.get('/', async (_, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactionsBalance = await transactionsRepository.getTransactionsBalance();

  return response.json(transactionsBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json({ id: transaction.id, title, type, value, category });
  // TODO
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTranscation = new DeleteTransactionService();

  await deleteTranscation.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  uploadCSV.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute({
      file: request.file.buffer,
    });

    return response.send(transactions);
    // TODO
  },
);

export default transactionsRouter;
