import { inngest } from "../client";
import { purgeExpiredRecords } from "@/lib/db/soft-delete";

/**
 * Scheduled job to permanently remove records that have been
 * soft-deleted for more than 30 days.
 *
 * Runs daily at 3am UTC via Inngest cron.
 */
export const purgeDeletedRecords = inngest.createFunction(
  {
    id: "purge-deleted-records",
    retries: 2,
  },
  { cron: "0 3 * * *" }, // 3am UTC daily
  async ({ step }) => {
    const result = await step.run("purge", async () => {
      return purgeExpiredRecords();
    });

    return result;
  }
);
