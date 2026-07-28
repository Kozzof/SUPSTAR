import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

dotenv.config({
  path: resolve(process.cwd(), '../.env'),
});

const requiredEnvironmentVariables = [
  'DB_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
] as const;

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(
      `La variable d'environnement ${variableName} est absente.`,
    );
  }
}

const dataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.POSTGRES_PORT),

  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  entities: [
    resolve(__dirname, '../**/*.entity{.ts,.js}'),
  ],

  migrations: [
    resolve(__dirname, '../migrations/*{.ts,.js}'),
  ],

  synchronize: false,
  migrationsRun: false,
  logging: false,
});

export default dataSource;