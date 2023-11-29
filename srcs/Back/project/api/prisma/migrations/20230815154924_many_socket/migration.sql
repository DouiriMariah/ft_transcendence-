-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "refreshtoken" TEXT,
    "password_A2f" TEXT,
    "login" TEXT,
    "nickname" TEXT,
    "avatar" TEXT,
    "status" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameInstance" (
    "id" SERIAL NOT NULL,
    "win" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "achievement" TEXT NOT NULL,
    "user_nickname" TEXT NOT NULL,

    CONSTRAINT "GameInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match_History" (
    "id" SERIAL NOT NULL,
    "my_score" INTEGER NOT NULL,
    "opponent_score" INTEGER NOT NULL,
    "opponent_nickname" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    "player_nickname" TEXT NOT NULL,

    CONSTRAINT "Match_History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedUsers" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,

    CONSTRAINT "BlockedUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "for" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "from" TEXT,
    "from_sessionID" TEXT,
    "to" TEXT,
    "to_sessionID" TEXT,
    "for_game" BOOLEAN NOT NULL,
    "for_group_chat" BOOLEAN NOT NULL,
    "to_be_friends" BOOLEAN NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "protected" TEXT,
    "chat_name" TEXT NOT NULL,
    "maxUsers" INTEGER,
    "owner_group_chat" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "from_id" TEXT NOT NULL,
    "name_chat" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_admin" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_banned" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_joined" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_muted" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "GameInstance_user_nickname_key" ON "GameInstance"("user_nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Friends_userId_friendId_key" ON "Friends"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedUsers_userId_blockerId_key" ON "BlockedUsers"("userId", "blockerId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionId_key" ON "sessions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_username_key" ON "sessions"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_chat_name_key" ON "Chat"("chat_name");

-- CreateIndex
CREATE UNIQUE INDEX "_admin_AB_unique" ON "_admin"("A", "B");

-- CreateIndex
CREATE INDEX "_admin_B_index" ON "_admin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_banned_AB_unique" ON "_banned"("A", "B");

-- CreateIndex
CREATE INDEX "_banned_B_index" ON "_banned"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_joined_AB_unique" ON "_joined"("A", "B");

-- CreateIndex
CREATE INDEX "_joined_B_index" ON "_joined"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_muted_AB_unique" ON "_muted"("A", "B");

-- CreateIndex
CREATE INDEX "_muted_B_index" ON "_muted"("B");

-- AddForeignKey
ALTER TABLE "GameInstance" ADD CONSTRAINT "GameInstance_user_nickname_fkey" FOREIGN KEY ("user_nickname") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match_History" ADD CONSTRAINT "Match_History_player_nickname_fkey" FOREIGN KEY ("player_nickname") REFERENCES "GameInstance"("user_nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUsers" ADD CONSTRAINT "BlockedUsers_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUsers" ADD CONSTRAINT "BlockedUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("nickname") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_fkey" FOREIGN KEY ("from") REFERENCES "sessions"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_name_chat_fkey" FOREIGN KEY ("name_chat") REFERENCES "Chat"("chat_name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_B_fkey" FOREIGN KEY ("B") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_B_fkey" FOREIGN KEY ("B") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joined" ADD CONSTRAINT "_joined_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joined" ADD CONSTRAINT "_joined_B_fkey" FOREIGN KEY ("B") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_B_fkey" FOREIGN KEY ("B") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
