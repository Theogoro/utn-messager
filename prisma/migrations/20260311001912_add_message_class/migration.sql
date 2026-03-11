-- CreateTable
CREATE TABLE "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "telegramChatId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DbMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "hasAttachments" BOOLEAN NOT NULL,
    "class" TEXT NOT NULL,
    "sentToTelegram" BOOLEAN NOT NULL DEFAULT false,
    "studentId" INTEGER NOT NULL,
    CONSTRAINT "DbMessage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_user_service_key" ON "Student"("user", "service");
