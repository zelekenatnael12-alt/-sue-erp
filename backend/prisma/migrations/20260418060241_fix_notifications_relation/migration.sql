-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "region" TEXT,
    "subRegion" TEXT,
    "area" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedBy" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Announcement_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Announcement" ("area", "areaId", "authorId", "content", "createdAt", "id", "region", "regionId", "subRegion", "subRegionId", "title") SELECT "area", "areaId", "authorId", "content", "createdAt", "id", "region", "regionId", "subRegion", "subRegionId", "title" FROM "Announcement";
DROP TABLE "Announcement";
ALTER TABLE "new_Announcement" RENAME TO "Announcement";
CREATE TABLE "new_School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "smallGroupCount" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NO_FELLOWSHIP',
    "registeredById" INTEGER NOT NULL,
    "isProxy" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "approvedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" DATETIME,
    "verifiedById" INTEGER,
    CONSTRAINT "School_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "School_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_School" ("approvalStatus", "approvedById", "areaId", "createdAt", "id", "isProxy", "location", "memberCount", "name", "regionId", "registeredById", "smallGroupCount", "status", "subRegionId") SELECT "approvalStatus", "approvedById", "areaId", "createdAt", "id", "isProxy", "location", "memberCount", "name", "regionId", "registeredById", "smallGroupCount", "status", "subRegionId" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE TABLE "new_Volunteer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "registeredById" INTEGER NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" DATETIME,
    "verifiedById" INTEGER,
    CONSTRAINT "Volunteer_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Volunteer" ("areaId", "createdAt", "id", "name", "phone", "regionId", "registeredById", "subRegionId") SELECT "areaId", "createdAt", "id", "name", "phone", "regionId", "registeredById", "subRegionId" FROM "Volunteer";
DROP TABLE "Volunteer";
ALTER TABLE "new_Volunteer" RENAME TO "Volunteer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
