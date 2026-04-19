-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
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
    CONSTRAINT "ProjectPlan_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProjectPlan_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProjectPlan" ("associateStaffCount", "authorId", "content", "coordinatorId", "createdAt", "decidedAt", "description", "fellowshipNotSuSchools", "fullTimeStaffCount", "id", "leadRoles", "middleSchools", "noFellowshipSchools", "orgStructure", "projectName", "projectType", "reviewerComments", "reviewerId", "status", "suFellowshipSchools", "submittedAt", "title", "totalHighSchools", "totalStaff", "updatedAt", "viewedAt", "volunteerCount") SELECT "associateStaffCount", "authorId", "content", "coordinatorId", "createdAt", "decidedAt", "description", "fellowshipNotSuSchools", "fullTimeStaffCount", "id", "leadRoles", "middleSchools", "noFellowshipSchools", "orgStructure", "projectName", "projectType", "reviewerComments", "reviewerId", "status", "suFellowshipSchools", "submittedAt", "title", "totalHighSchools", "totalStaff", "updatedAt", "viewedAt", "volunteerCount" FROM "ProjectPlan";
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
    "coordinatorId" INTEGER NOT NULL,
    "projectPlanId" INTEGER NOT NULL,
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
    CONSTRAINT "Report_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_projectPlanId_fkey" FOREIGN KEY ("projectPlanId") REFERENCES "ProjectPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("actualsMatrix", "authorId", "budgetSpent", "content", "coordinatorId", "dateSubmitted", "decidedAt", "expenseAmount", "id", "narrative", "projectPlanId", "receiptUrl", "reportMonth", "reportYear", "reviewerComments", "reviewerId", "status", "submittedAt", "title", "type", "viewedAt") SELECT "actualsMatrix", "authorId", "budgetSpent", "content", "coordinatorId", "dateSubmitted", "decidedAt", "expenseAmount", "id", "narrative", "projectPlanId", "receiptUrl", "reportMonth", "reportYear", "reviewerComments", "reviewerId", "status", "submittedAt", "title", "type", "viewedAt" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
