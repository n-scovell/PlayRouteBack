-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestPlay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "playType" TEXT NOT NULL,
    "description" TEXT,
    "grid" JSONB,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestFormation" (
    "id" TEXT NOT NULL,
    "formationName" TEXT NOT NULL,
    "grid" JSONB,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestFormation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuestPlay" ADD CONSTRAINT "GuestPlay_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestFormation" ADD CONSTRAINT "GuestFormation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
