-- AlterTable
ALTER TABLE "users" ALTER COLUMN "token" DROP NOT NULL;

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "last_name" VARCHAR(100),
    "first_name" VARCHAR(100),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "username" VARCHAR(100) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
