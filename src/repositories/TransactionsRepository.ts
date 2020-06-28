import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getTransactionsBalance(): Promise<{
    transactions: Transaction[];
    balance: Balance;
  }> {
    const transactions = await this.find({
      select: [
        'id',
        'title',
        'value',
        'type',
        'category',
        'created_at',
        'updated_at',
      ],
      relations: ['category'],
    });

    const { income, outcome } = transactions.reduce(
      (accumulator, transcation) => {
        accumulator[transcation.type] += transcation.value;
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    const balance = { income, outcome, total: income - outcome };

    return { transactions, balance };
  }

  public async getBalance(): Promise<Balance> {
    return (await this.getTransactionsBalance()).balance;
  }
}

export default TransactionsRepository;
