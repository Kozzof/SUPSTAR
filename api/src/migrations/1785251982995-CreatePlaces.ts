import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlaces1785251982995 implements MigrationInterface {
    name = 'CreatePlaces1785251982995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_id" uuid NOT NULL, "name" character varying(160) NOT NULL, "address" character varying(500) NOT NULL, "city" character varying(120) NOT NULL, "country" character varying(120) NOT NULL, "category" character varying(80) NOT NULL, "description" text NOT NULL, "opening_hours" jsonb, "price_level" smallint, "tags" text array NOT NULL DEFAULT ARRAY[]::text[], "rating_average" double precision NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "location" geography(Point,4326) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_places_rating_average" CHECK ("rating_average" BETWEEN 0 AND 5), CONSTRAINT "CHK_places_price_level" CHECK ("price_level" IS NULL OR "price_level" BETWEEN 1 AND 4), CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b8ee226e91e428a57c5d1ac84c" ON "places" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_places_category" ON "places" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_places_city" ON "places" ("city") `);
        await queryRunner.query(`CREATE INDEX "IDX_places_name" ON "places" ("name") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ADD CONSTRAINT "FK_f4e7f3b52dc2abe69ea75f011df" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "places" DROP CONSTRAINT "FK_f4e7f3b52dc2abe69ea75f011df"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_places_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_places_city"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_places_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8ee226e91e428a57c5d1ac84c"`);
        await queryRunner.query(`DROP TABLE "places"`);
    }

}
