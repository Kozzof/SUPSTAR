import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlaceStatuses1787749756905 implements MigrationInterface {
    name = 'CreatePlaceStatuses1787749756905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "place_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "place_id" uuid NOT NULL, "visited" boolean NOT NULL DEFAULT false, "want_to_visit" boolean NOT NULL DEFAULT false, "favorite" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_place_statuses_user_place" UNIQUE ("user_id", "place_id"), CONSTRAINT "PK_7f3b137cc2b210a8998c270a9d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_place_statuses_place_id" ON "place_statuses" ("place_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_place_statuses_user_id" ON "place_statuses" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "place_statuses" ADD CONSTRAINT "FK_27fc1ca4da13d0c3114b4f05371" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "place_statuses" ADD CONSTRAINT "FK_93bf23b100c171f3aafec25686c" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "place_statuses" DROP CONSTRAINT "FK_93bf23b100c171f3aafec25686c"`);
        await queryRunner.query(`ALTER TABLE "place_statuses" DROP CONSTRAINT "FK_27fc1ca4da13d0c3114b4f05371"`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_place_statuses_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_place_statuses_place_id"`);
        await queryRunner.query(`DROP TABLE "place_statuses"`);
    }

}
