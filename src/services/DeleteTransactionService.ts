import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

// import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const deleteTranscation = await transactionsRepository.delete({ id });

    if (deleteTranscation.affected === 0) {
      throw new AppError(`Couldn't find transaction ${id}`, 400);
    }
    // const transaction = await transactionsRepository.findOne({ id });
    // TODO
  }
}

export default DeleteTransactionService;
