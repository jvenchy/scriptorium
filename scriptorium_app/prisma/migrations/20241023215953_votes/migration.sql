-- CreateTable
CREATE TABLE "BlogPostVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "blogPostId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "voteType" TEXT NOT NULL,
    CONSTRAINT "BlogPostVote_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BlogPostVote_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostVote_blogPostId_accountId_key" ON "BlogPostVote"("blogPostId", "accountId");
