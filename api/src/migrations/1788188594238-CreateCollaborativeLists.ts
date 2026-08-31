import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCollaborativeLists1788188594238 implements MigrationInterface {
    name = 'CreateCollaborativeLists1788188594238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "place_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_by_id" uuid NOT NULL, "name" character varying(120) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_317aa1b2802cef781a7cb78c3a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_place_lists_created_by_id" ON "place_lists" ("created_by_id") `);
        await queryRunner.query(`CREATE TABLE "list_places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "list_id" uuid NOT NULL, "place_id" uuid NOT NULL, "added_by_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_list_places_list_place" UNIQUE ("list_id", "place_id"), CONSTRAINT "PK_ddf144ab5e235baff48a26dda00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_list_places_place_id" ON "list_places" ("place_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_list_places_list_id" ON "list_places" ("list_id") `);
        await queryRunner.query(`CREATE TYPE "public"."list_members_role_enum" AS ENUM('creator', 'editor', 'commenter', 'reader')`);
        await queryRunner.query(`CREATE TABLE "list_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "list_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" "public"."list_members_role_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_list_members_list_user" UNIQUE ("list_id", "user_id"), CONSTRAINT "PK_2aa7c4506690822c0f9751451ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_list_members_user_id" ON "list_members" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_list_members_list_id" ON "list_members" ("list_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "place_lists" ADD CONSTRAINT "FK_1d8e21f4c9c4df44318afcb6aba" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_places" ADD CONSTRAINT "FK_27c3f85b4d6ac63145e4eaaf22a" FOREIGN KEY ("list_id") REFERENCES "place_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_places" ADD CONSTRAINT "FK_edc5aa7d5dd9446e66e2a06e123" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_places" ADD CONSTRAINT "FK_8e76d7b2bb706f1e6cca4425476" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_members" ADD CONSTRAINT "FK_ca7284163c1588f439f829edfc8" FOREIGN KEY ("list_id") REFERENCES "place_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "list_members" ADD CONSTRAINT "FK_4b94983668064e87732a0c63109" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "list_members" DROP CONSTRAINT "FK_4b94983668064e87732a0c63109"`);
        await queryRunner.query(`ALTER TABLE "list_members" DROP CONSTRAINT "FK_ca7284163c1588f439f829edfc8"`);
        await queryRunner.query(`ALTER TABLE "list_places" DROP CONSTRAINT "FK_8e76d7b2bb706f1e6cca4425476"`);
        await queryRunner.query(`ALTER TABLE "list_places" DROP CONSTRAINT "FK_edc5aa7d5dd9446e66e2a06e123"`);
        await queryRunner.query(`ALTER TABLE "list_places" DROP CONSTRAINT "FK_27c3f85b4d6ac63145e4eaaf22a"`);
        await queryRunner.query(`ALTER TABLE "place_lists" DROP CONSTRAINT "FK_1d8e21f4c9c4df44318afcb6aba"`);
        await queryRunner.query(`ALTER TABLE "places" ALTER COLUMN "tags" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "travel_preferences" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_members_list_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_members_user_id"`);
        await queryRunner.query(`DROP TABLE "list_members"`);
        await queryRunner.query(`DROP TYPE "public"."list_members_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_places_list_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_list_places_place_id"`);
        await queryRunner.query(`DROP TABLE "list_places"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_place_lists_created_by_id"`);
        await queryRunner.query(`DROP TABLE "place_lists"`);
    }

}
