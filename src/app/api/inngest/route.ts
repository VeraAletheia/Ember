import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processCapture } from "@/lib/inngest/functions/process-capture";
import { purgeDeletedRecords } from "@/lib/inngest/functions/purge-deleted";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processCapture, purgeDeletedRecords],
});
