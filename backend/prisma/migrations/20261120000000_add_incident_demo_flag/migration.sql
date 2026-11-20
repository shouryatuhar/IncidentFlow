ALTER TABLE "incidents" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "incidents_isDemo_idx" ON "incidents"("isDemo");
