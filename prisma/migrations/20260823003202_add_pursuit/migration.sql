-- CreateEnum
CREATE TYPE "Pursuit" AS ENUM ('offense', 'defense');

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "pursuit" "Pursuit" NOT NULL DEFAULT 'offense';

-- AlterTable
ALTER TABLE "Play" ADD COLUMN     "pursuit" "Pursuit" NOT NULL DEFAULT 'offense';
