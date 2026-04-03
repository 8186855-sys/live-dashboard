import { cleanupOldActivities, cleanupOldHealthRecords, markOfflineDevices } from "../db";

// Cleanup old activities every hour
setInterval(async () => {
  try {
    const [deletedActivities, deletedHealthRecords] = await Promise.all([
      cleanupOldActivities(),
      cleanupOldHealthRecords(),
    ]);

    if (deletedActivities > 0) {
      console.log(`[cleanup] Deleted ${deletedActivities} old activity records`);
    }
    if (deletedHealthRecords > 0) {
      console.log(`[cleanup] Deleted ${deletedHealthRecords} old health records`);
    }
  } catch (e) {
    console.error("[cleanup] Failed:", e);
  }
}, 60 * 60 * 1000);

// Mark offline devices every 60 seconds
setInterval(async () => {
  try {
    await markOfflineDevices();
  } catch {
    // silent
  }
}, 60_000);

console.log("[cleanup] Scheduled: hourly data cleanup + 60s offline check");
