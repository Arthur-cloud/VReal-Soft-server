import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "refreshToken" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create folders table
    await queryRunner.query(`
      CREATE TABLE "folders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "parentId" uuid,
        "ownerId" uuid NOT NULL,
        "isPublic" boolean NOT NULL DEFAULT false,
        "publicLink" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_folders_id" PRIMARY KEY ("id")
      )
    `);

    // Create files table
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "path" character varying NOT NULL,
        "size" bigint NOT NULL,
        "mimeType" character varying NOT NULL,
        "ownerId" uuid NOT NULL,
        "folderId" uuid,
        "isPublic" boolean NOT NULL DEFAULT false,
        "publicLink" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id")
      )
    `);

    // Create file_permissions table
    await queryRunner.query(`
      CREATE TYPE "file_permissions_permission_enum" AS ENUM('view', 'edit', 'delete', 'share', 'manage')
    `);

    await queryRunner.query(`
      CREATE TABLE "file_permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileId" uuid,
        "folderId" uuid,
        "userId" uuid,
        "email" character varying,
        "permission" "file_permissions_permission_enum" NOT NULL DEFAULT 'view',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file_permissions_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "folders"
      ADD CONSTRAINT "FK_folders_parent"
      FOREIGN KEY ("parentId") REFERENCES "folders"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "folders"
      ADD CONSTRAINT "FK_folders_owner"
      FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_owner"
      FOREIGN KEY ("ownerId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_folder"
      FOREIGN KEY ("folderId") REFERENCES "folders"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "file_permissions"
      ADD CONSTRAINT "FK_file_permissions_file"
      FOREIGN KEY ("fileId") REFERENCES "files"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "file_permissions"
      ADD CONSTRAINT "FK_file_permissions_folder"
      FOREIGN KEY ("folderId") REFERENCES "folders"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "file_permissions"
      ADD CONSTRAINT "FK_file_permissions_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_folders_ownerId" ON "folders" ("ownerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_folders_parentId" ON "folders" ("parentId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_files_ownerId" ON "files" ("ownerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_files_folderId" ON "files" ("folderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_permissions_fileId" ON "file_permissions" ("fileId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_permissions_folderId" ON "file_permissions" ("folderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_permissions_userId" ON "file_permissions" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_permissions_email" ON "file_permissions" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_file_permissions_email"`);
    await queryRunner.query(`DROP INDEX "IDX_file_permissions_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_file_permissions_folderId"`);
    await queryRunner.query(`DROP INDEX "IDX_file_permissions_fileId"`);
    await queryRunner.query(`DROP INDEX "IDX_files_folderId"`);
    await queryRunner.query(`DROP INDEX "IDX_files_ownerId"`);
    await queryRunner.query(`DROP INDEX "IDX_folders_parentId"`);
    await queryRunner.query(`DROP INDEX "IDX_folders_ownerId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "file_permissions" DROP CONSTRAINT "FK_file_permissions_user"`);
    await queryRunner.query(`ALTER TABLE "file_permissions" DROP CONSTRAINT "FK_file_permissions_folder"`);
    await queryRunner.query(`ALTER TABLE "file_permissions" DROP CONSTRAINT "FK_file_permissions_file"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_folder"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_owner"`);
    await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_folders_owner"`);
    await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_folders_parent"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "file_permissions"`);
    await queryRunner.query(`DROP TYPE "file_permissions_permission_enum"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TABLE "folders"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
