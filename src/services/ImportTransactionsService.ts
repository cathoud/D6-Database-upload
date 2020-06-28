import parse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  file: Buffer;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const parsedTransactions: CSVTransaction[] = [];
    const categories: string[] = [];
    const parser = parse(file.toString(), { columns: true, trim: true });
    parser.on('readable', () => {
      let transaction: CSVTransaction;
      while ((transaction = parser.read())) {
        parsedTransactions.push(transaction);
        categories.push(transaction.category);
      }
    });

    await new Promise(resolve => parser.on('end', resolve));

    const categoriesRepository = getRepository(Category);

    const existingCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existingCategoriesTitles = existingCategories.map(
      (transaction: Category) => transaction.title,
    );

    const addCategories = categories
      .filter(category => !existingCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...existingCategories, ...newCategories];

    const transactionsRepositiory = getCustomRepository(TransactionsRepository);

    const transactions = transactionsRepositiory.create(
      parsedTransactions.map(
        ({ category, type, title, value }: CSVTransaction) => ({
          title,
          value,
          type,
          category: finalCategories.find(
            finalCategory => finalCategory.title === category,
          ),
        }),
      ),
    );

    await transactionsRepositiory.save(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
