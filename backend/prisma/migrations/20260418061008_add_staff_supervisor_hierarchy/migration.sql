-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "supervisorId" INTEGER,
    CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_subRegionId_fkey" FOREIGN KEY ("subRegionId") REFERENCES "SubRegion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("area", "areaId", "baseSalary", "bloodType", "createdAt", "department", "departmentAm", "email", "emergencyContact", "expireDate", "firstNameAm", "fullNameAmharic", "full_name", "id", "idNumber", "isActive", "issueDate", "lastNameAm", "legacyId", "monthlySalary", "mustChangePassword", "nationality", "officeAddress", "passwordHash", "phone", "photoUrl", "region", "regionId", "role", "roleAmharic", "subDepartment", "subRegion", "subRegionId", "title", "titleAm", "updatedAt") SELECT "area", "areaId", "baseSalary", "bloodType", "createdAt", "department", "departmentAm", "email", "emergencyContact", "expireDate", "firstNameAm", "fullNameAmharic", "full_name", "id", "idNumber", "isActive", "issueDate", "lastNameAm", "legacyId", "monthlySalary", "mustChangePassword", "nationality", "officeAddress", "passwordHash", "phone", "photoUrl", "region", "regionId", "role", "roleAmharic", "subDepartment", "subRegion", "subRegionId", "title", "titleAm", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
