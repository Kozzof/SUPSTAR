import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateListComments1788195108031 implements MigrationInterface {
    name = 'CreateListComments1788195108031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "list_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "list_id" uuid NOT NULL, "user_id" uuid NOT NULL, "comment" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_697ecf44b58e66992120f3165f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_list_comments_user_id" ON "list_comments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_list_comments_list_id" ON "list_comments" ("list_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "list_comments" ADD CONSTRAINT "FK_a1c2c99de61fa2b02dfb1ac7ed6" FOREIGN KEY ("list_id") REFERENCES "place_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_comments" ADD CONSTRAINT "FK_cdece4b10f52510f6819bdababc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "list_comments" DROP CONSTRAINT "FK_cdece4b10f52510f6819bdababc"`);
        await queryRunner.query(`ALTER TABLE "list_comments" DROP CONSTRAINT "FK_a1c2c99de61fa2b02dfb1ac7ed6"`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_comments_list_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_comments_user_id"`);
        await queryRunner.query(`DROP TABLE "list_comments"`);
    }

}
