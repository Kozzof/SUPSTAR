import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlacePhotos1788190272307 implements MigrationInterface {
    name = 'CreatePlacePhotos1788190272307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "place_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "place_id" uuid NOT NULL, "added_by_id" uuid, "url" character varying(2048) NOT NULL, "caption" character varying(300), "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_place_photos_place_url" UNIQUE ("place_id", "url"), CONSTRAINT "PK_137f021448aa0ee40672a18606a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_place_photos_place_id" ON "place_photos" ("place_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "place_photos" ADD CONSTRAINT "FK_9701d4fb58b28c0dfe06cd4805a" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "place_photos" ADD CONSTRAINT "FK_c7fd9b7f4bb4fd46a83e0d667cd" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "place_photos" DROP CONSTRAINT "FK_c7fd9b7f4bb4fd46a83e0d667cd"`);
        await queryRunner.query(`ALTER TABLE "place_photos" DROP CONSTRAINT "FK_9701d4fb58b28c0dfe06cd4805a"`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_place_photos_place_id"`);
        await queryRunner.query(`DROP TABLE "place_photos"`);
    }

}
