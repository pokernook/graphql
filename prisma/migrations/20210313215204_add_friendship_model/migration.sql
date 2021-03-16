-- CreateTable
CREATE TABLE "Friendship" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FriendshipToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FriendshipToUser_AB_unique" ON "_FriendshipToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_FriendshipToUser_B_index" ON "_FriendshipToUser"("B");

-- AddForeignKey
ALTER TABLE "_FriendshipToUser" ADD FOREIGN KEY ("A") REFERENCES "Friendship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendshipToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
