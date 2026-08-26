import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviews1787746746981 implements MigrationInterface {
    name = 'CreateReviews1787746746981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "place_id" uuid NOT NULL, "rating" smallint NOT NULL, "comment" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_reviews_user_place" UNIQUE ("user_id", "place_id"), CONSTRAINT "CHK_reviews_rating" CHECK ("rating" BETWEEN 1 AND 5), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_user_id" ON "reviews" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_place_id" ON "reviews" ("place_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_d2616b72cb3787ad20b88a3aa67" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_d2616b72cb3787ad20b88a3aa67"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_reviews_place_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_reviews_user_id"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
