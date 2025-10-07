-- CreateIndex
CREATE INDEX "Announcement_communityId_createdAt_idx" ON "Announcement"("communityId", "createdAt");

-- CreateIndex
CREATE INDEX "Badge_communityId_idx" ON "Badge"("communityId");

-- CreateIndex
CREATE INDEX "Community_isPublic_createdAt_idx" ON "Community"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Community_ownerId_idx" ON "Community"("ownerId");

-- CreateIndex
CREATE INDEX "CrowdfundingGoal_communityId_status_idx" ON "CrowdfundingGoal"("communityId", "status");

-- CreateIndex
CREATE INDEX "Event_communityId_status_idx" ON "Event"("communityId", "status");

-- CreateIndex
CREATE INDEX "Event_communityId_startsAt_idx" ON "Event"("communityId", "startsAt");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_userId_idx" ON "EventRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_communityId_idx" ON "Payment"("communityId");

-- CreateIndex
CREATE INDEX "Payment_eventId_idx" ON "Payment"("eventId");

-- CreateIndex
CREATE INDEX "Poll_communityId_createdAt_idx" ON "Poll"("communityId", "createdAt");
