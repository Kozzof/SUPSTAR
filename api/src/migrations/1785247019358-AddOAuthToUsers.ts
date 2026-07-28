import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOAuthToUsers1785247019358 implements MigrationInterface {
    name = 'AddOAuthToUsers1785247019358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "oauth_provider" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "oauth_subject" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_oauth_identity" ON "users"  ("oauth_provider", "oauth_subject") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_users_oauth_identity"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "oauth_subject"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "oauth_provider"`);
    }

}
