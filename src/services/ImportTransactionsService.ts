import parse from 'csv-parse';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface Request {
  file: Buffer;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: 'string';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const parsedTransactions: CSVTransaction[] = [];

    await new Promise((resolve, _) => {
      const parser = parse(file.toString(), { columns: true, trim: true });
      parser.on('readable', () => {
        let transaction;
        while ((transaction = parser.read())) {
          parsedTransactions.push(transaction);
        }
        resolve();
      });
    }).then();

    const createTransaction = new CreateTransactionService();

    const incomeTransactions = await Promise.all(
      parsedTransactions
        .filter(transaction => transaction.type === 'income')
        .map(transaction => createTransaction.execute(transaction)),
    );

    const outcomeTransactions = await Promise.all(
      parsedTransactions
        .filter(transaction => transaction.type === 'outcome')
        .map(transaction => createTransaction.execute(transaction)),
    );

    return [...incomeTransactions, ...outcomeTransactions];
  }
}

export default ImportTransactionsService;
