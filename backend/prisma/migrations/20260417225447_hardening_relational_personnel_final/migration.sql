/*
  Warnings:

  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `region` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `subRegion` on the `Area` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ProjectPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[legacyId]` on the table `AdvisoryMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subRegionId` to the `Area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvisoryMember" ADD COLUMN "legacyId" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Staff";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubRegion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    CONSTRAINT "SubRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "Announcement_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Announcement" ("area", "authorId", "content", "createdAt", "id", "region", "subRegion", "title") SELECT "area", "authorId", "content", "createdAt", "id", "region", "subRegion", "title" FROM "Announcement";
DROP TABLE "Announcement";
ALTER TABLE "new_Announcement" RENAME TO "Announcement";
CREATE TABLE "new_Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "boundaries" TEXT,
    "justification" TEXT,
    "subRegionId" TEXT NOT NULL,
    "zone" TEXT,
    "town" TEXT,
    "contactPerson" TEXT,
    "fellowshipsCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REGIONAL',
    "proposedById" INTEGER NOT NULL,
    CONSTRAINT "Area_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Area_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Area" ("boundaries", "id", "justification", "name", "proposedById", "status") SELECT "boundaries", "id", "justification", "name", "proposedById", "status" FROM "Area";
DROP TABLE "Area";
ALTER TABLE "new_Area" RENAME TO "Area";
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'NEW',
    "maintenanceNote" TEXT,
    "currentHolderId" INTEGER,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "legacyId" TEXT,
    CONSTRAINT "Asset_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_currentHolderId_fkey" FOREIGN KEY ("currentHolderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Asset" ("condition", "createdAt", "currentHolderId", "id", "maintenanceNote", "name", "region", "serialNumber", "updatedAt", "value") SELECT "condition", "createdAt", "currentHolderId", "id", "maintenanceNote", "name", "region", "serialNumber", "updatedAt", "value" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");
CREATE UNIQUE INDEX "Asset_legacyId_key" ON "Asset"("legacyId");
CREATE TABLE "new_Associate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "backgroundInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "registeredById" INTEGER NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Associate_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Associate_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Associate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Associate_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Associate" ("backgroundInfo", "createdAt", "id", "name", "phone", "photoUrl", "registeredById", "status") SELECT "backgroundInfo", "createdAt", "id", "name", "phone", "photoUrl", "registeredById", "status" FROM "Associate";
DROP TABLE "Associate";
ALTER TABLE "new_Associate" RENAME TO "Associate";
CREATE TABLE "new_CapacityRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleRequested" TEXT NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "location" TEXT,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SUB_REGION',
    "requesterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CapacityRequest_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CapacityRequest_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CapacityRequest_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CapacityRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CapacityRequest" ("createdAt", "id", "justification", "location", "requesterId", "roleRequested", "status", "updatedAt") SELECT "createdAt", "id", "justification", "location", "requesterId", "roleRequested", "status", "updatedAt" FROM "CapacityRequest";
DROP TABLE "CapacityRequest";
ALTER TABLE "new_CapacityRequest" RENAME TO "CapacityRequest";
CREATE TABLE "new_Donor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "areaStaffId" INTEGER NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "conflictStatus" TEXT NOT NULL DEFAULT 'CLEARED',
    "conflictNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donor_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donor_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Donor_areaStaffId_fkey" FOREIGN KEY ("areaStaffId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Donor" ("areaStaffId", "conflictNote", "conflictStatus", "createdAt", "email", "id", "name", "phone") SELECT "areaStaffId", "conflictNote", "conflictStatus", "createdAt", "email", "id", "name", "phone" FROM "Donor";
DROP TABLE "Donor";
ALTER TABLE "new_Donor" RENAME TO "Donor";
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "subRegion" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("authorId", "createdAt", "date", "description", "id", "location", "subRegion", "title") SELECT "authorId", "createdAt", "date", "description", "id", "location", "subRegion", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "contactDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "registeredById" INTEGER NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Partner_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Partner_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Partner_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Partner_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Partner" ("contactDetails", "createdAt", "id", "name", "partnerType", "registeredById", "status") SELECT "contactDetails", "createdAt", "id", "name", "partnerType", "registeredById", "status" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE TABLE "new_ProjectPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT,
    "description" TEXT,
    "orgStructure" TEXT,
    "leadRoles" TEXT,
    "totalStaff" INTEGER,
    "totalHighSchools" INTEGER,
    "suFellowshipSchools" INTEGER,
    "fellowshipNotSuSchools" INTEGER,
    "noFellowshipSchools" INTEGER,
    "middleSchools" INTEGER,
    "fullTimeStaffCount" INTEGER,
    "associateStaffCount" INTEGER,
    "volunteerCount" INTEGER,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "coordinatorId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "authorId" INTEGER,
    "submittedAt" DATETIME,
    "viewedAt" DATETIME,
    "decidedAt" DATETIME,
    "reviewerId" INTEGER,
    "reviewerComments" TEXT,
    "reportType" TEXT NOT NULL DEFAULT 'FIELD',
    "subDepartment" TEXT,
    "metricsJson" TEXT,
    CONSTRAINT "ProjectPlan_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjectPlan" ("associateStaffCount", "authorId", "content", "coordinatorId", "createdAt", "decidedAt", "description", "fellowshipNotSuSchools", "fullTimeStaffCount", "id", "leadRoles", "metricsJson", "middleSchools", "noFellowshipSchools", "orgStructure", "projectName", "projectType", "reportType", "reviewerComments", "reviewerId", "suFellowshipSchools", "subDepartment", "submittedAt", "title", "totalHighSchools", "totalStaff", "updatedAt", "viewedAt", "volunteerCount") SELECT "associateStaffCount", "authorId", "content", "coordinatorId", "createdAt", "decidedAt", "description", "fellowshipNotSuSchools", "fullTimeStaffCount", "id", "leadRoles", "metricsJson", "middleSchools", "noFellowshipSchools", "orgStructure", "projectName", "projectType", "reportType", "reviewerComments", "reviewerId", "suFellowshipSchools", "subDepartment", "submittedAt", "title", "totalHighSchools", "totalStaff", "updatedAt", "viewedAt", "volunteerCount" FROM "ProjectPlan";
DROP TABLE "ProjectPlan";
ALTER TABLE "new_ProjectPlan" RENAME TO "ProjectPlan";
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "reportMonth" TEXT,
    "reportYear" INTEGER,
    "budgetSpent" REAL DEFAULT 0,
    "narrative" TEXT,
    "actualsMatrix" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "dateSubmitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coordinatorId" INTEGER,
    "projectPlanId" INTEGER,
    "receiptUrl" TEXT,
    "expenseAmount" REAL,
    "content" TEXT,
    "authorId" INTEGER,
    "submittedAt" DATETIME,
    "viewedAt" DATETIME,
    "decidedAt" DATETIME,
    "reviewerId" INTEGER,
    "reviewerComments" TEXT,
    "reportType" TEXT NOT NULL DEFAULT 'FIELD',
    "subDepartment" TEXT,
    "metricsJson" TEXT,
    "ministryRaised" REAL DEFAULT 0,
    "ministryExpended" REAL DEFAULT 0,
    "receiptJustification" TEXT,
    CONSTRAINT "Report_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_projectPlanId_fkey" FOREIGN KEY ("projectPlanId") REFERENCES "ProjectPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("actualsMatrix", "authorId", "budgetSpent", "content", "coordinatorId", "dateSubmitted", "decidedAt", "expenseAmount", "id", "metricsJson", "narrative", "projectPlanId", "receiptUrl", "reportMonth", "reportType", "reportYear", "reviewerComments", "reviewerId", "status", "subDepartment", "submittedAt", "title", "type", "viewedAt") SELECT "actualsMatrix", "authorId", "budgetSpent", "content", "coordinatorId", "dateSubmitted", "decidedAt", "expenseAmount", "id", "metricsJson", "narrative", "projectPlanId", "receiptUrl", "reportMonth", "reportType", "reportYear", "reviewerComments", "reviewerId", "status", "subDepartment", "submittedAt", "title", "type", "viewedAt" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE TABLE "new_School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NO_FELLOWSHIP',
    "registeredById" INTEGER NOT NULL,
    "isProxy" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "approvedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "School_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "School_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_School" ("approvalStatus", "approvedById", "createdAt", "id", "isProxy", "location", "name", "registeredById", "status") SELECT "approvalStatus", "approvedById", "createdAt", "id", "isProxy", "location", "name", "registeredById", "status" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "region" TEXT,
    "subRegion" TEXT,
    "area" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "monthlySalary" REAL NOT NULL DEFAULT 0,
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "subDepartment" TEXT,
    "idNumber" TEXT,
    "title" TEXT,
    "titleAm" TEXT,
    "firstNameAm" TEXT,
    "lastNameAm" TEXT,
    "fullNameAmharic" TEXT,
    "roleAmharic" TEXT,
    "department" TEXT,
    "departmentAm" TEXT,
    "photoUrl" TEXT,
    "phone" TEXT,
    "emergencyContact" TEXT,
    "bloodType" TEXT,
    "officeAddress" TEXT DEFAULT 'HEAD OFFICE / ዋና ቢሮ',
    "nationality" TEXT DEFAULT 'ETHIOPIAN / ኢትዮጵያዊ',
    "issueDate" DATETIME,
    "expireDate" DATETIME,
    "legacyId" TEXT,
    CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("area", "baseSalary", "bloodType", "createdAt", "department", "departmentAm", "email", "emergencyContact", "expireDate", "firstNameAm", "fullNameAmharic", "full_name", "id", "idNumber", "isActive", "issueDate", "lastNameAm", "monthlySalary", "mustChangePassword", "nationality", "officeAddress", "passwordHash", "phone", "photoUrl", "region", "role", "roleAmharic", "subDepartment", "subRegion", "title", "titleAm", "updatedAt") SELECT "area", "baseSalary", "bloodType", "createdAt", "department", "departmentAm", "email", "emergencyContact", "expireDate", "firstNameAm", "fullNameAmharic", "full_name", "id", "idNumber", "isActive", "issueDate", "lastNameAm", "monthlySalary", "mustChangePassword", "nationality", "officeAddress", "passwordHash", "phone", "photoUrl", "region", "role", "roleAmharic", "subDepartment", "subRegion", "title", "titleAm", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");
CREATE TABLE "new_Volunteer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "registeredById" INTEGER NOT NULL,
    "regionId" TEXT,
    "subRegionId" TEXT,
    "areaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Volunteer_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Volunteer_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Volunteer" ("createdAt", "id", "name", "phone", "registeredById") SELECT "createdAt", "id", "name", "phone", "registeredById" FROM "Volunteer";
DROP TABLE "Volunteer";
ALTER TABLE "new_Volunteer" RENAME TO "Volunteer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisoryMember_legacyId_key" ON "AdvisoryMember"("legacyId");
