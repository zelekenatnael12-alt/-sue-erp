-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdvisoryMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "church" TEXT,
    "profession" TEXT,
    "phone" TEXT,
    "termStart" DATETIME NOT NULL,
    "termEnd" DATETIME NOT NULL,
    "termNumber" INTEGER NOT NULL DEFAULT 1,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_NATIONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdvisoryMember" ("church", "createdAt", "fullName", "id", "phone", "profession", "region", "termEnd", "termNumber", "termStart") SELECT "church", "createdAt", "fullName", "id", "phone", "profession", "region", "termEnd", "termNumber", "termStart" FROM "AdvisoryMember";
DROP TABLE "AdvisoryMember";
ALTER TABLE "new_AdvisoryMember" RENAME TO "AdvisoryMember";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
