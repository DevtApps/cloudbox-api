import { Sequelize } from 'sequelize-typescript';
import { User } from './entities/user.entity';
import { Archive } from './entities/archive.entity';
import { ArchivePolicy } from './entities/archive-policy.entity';
import { Limits } from './entities/limits.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: 5432,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
      });
      sequelize.addModels([User, Limits, Archive, ArchivePolicy]);
      await sequelize.sync();
      return sequelize;
    },
  },
];