import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5433),
  username: process.env.POSTGRES_USER ?? 'authkit_user',
  password: process.env.POSTGRES_PASSWORD ?? 'authkit_pass_123',
  database: process.env.POSTGRES_DB ?? 'authkit',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default dataSource;
