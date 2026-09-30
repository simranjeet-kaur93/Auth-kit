import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuthkit1720970000000 implements MigrationInterface {
  name = 'InitAuthkit1720970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying,
        "passwordHash" character varying,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "mfaEnabled" boolean NOT NULL DEFAULT false,
        "mfaMethod" character varying,
        "phoneNumber" character varying,
        "googleId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
