/*
  Warnings:

  - Added the required column `updatedAt` to the `BlogPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "numReports" INTEGER NOT NULL DEFAULT 0,
    "authorId" INTEGER NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("authorId", "canEdit", "description", "downvotes", "id", "isVisible", "numReports", "title", "upvotes") SELECT "authorId", "canEdit", "description", "downvotes", "id", "isVisible", "numReports", "title", "upvotes" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentCommentId" INTEGER,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "numReports" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("authorId", "blogPostId", "content", "id") SELECT "authorId", "blogPostId", "content", "id" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
