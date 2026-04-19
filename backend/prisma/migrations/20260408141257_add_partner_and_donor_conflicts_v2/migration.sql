-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "contactDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "registeredById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Partner_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "areaStaffId" INTEGER NOT NULL,
    "conflictStatus" TEXT NOT NULL DEFAULT 'CLEARED',
    "conflictNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donor_areaStaffId_fkey" FOREIGN KEY ("areaStaffId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Donor" ("areaStaffId", "createdAt", "email", "id", "name", "phone") SELECT "areaStaffId", "createdAt", "email", "id", "name", "phone" FROM "Donor";
DROP TABLE "Donor";
ALTER TABLE "new_Donor" RENAME TO "Donor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
