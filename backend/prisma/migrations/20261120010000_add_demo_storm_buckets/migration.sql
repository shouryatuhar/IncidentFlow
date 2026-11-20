CREATE TABLE "demo_storm_buckets" (
    "userId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "demo_storm_buckets_pkey" PRIMARY KEY ("userId", "idempotencyKey")
);

CREATE INDEX "demo_storm_buckets_windowStartedAt_idx"
ON "demo_storm_buckets"("windowStartedAt");
