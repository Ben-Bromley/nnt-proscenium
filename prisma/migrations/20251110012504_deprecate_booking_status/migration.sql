/*
  Warnings:

  - You are about to drop the column `endDateTime` on the `Performance` table. All the data in the column will be lost.
  - You are about to drop the column `reservationsOpen` on the `Performance` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Performance` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "runtimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "intervalMinutes" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "details" TEXT,
    "maxCapacity" INTEGER NOT NULL,
    "reservationInstructions" TEXT,
    "externalBookingLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showId" TEXT,
    "venueId" TEXT,
    CONSTRAINT "Performance_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Performance_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Performance" ("createdAt", "details", "externalBookingLink", "id", "isActive", "maxCapacity", "reservationInstructions", "showId", "startDateTime", "title", "type", "updatedAt", "venueId") SELECT "createdAt", "details", "externalBookingLink", "id", "isActive", "maxCapacity", "reservationInstructions", "showId", "startDateTime", "title", "type", "updatedAt", "venueId" FROM "Performance";
DROP TABLE "Performance";
ALTER TABLE "new_Performance" RENAME TO "Performance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
