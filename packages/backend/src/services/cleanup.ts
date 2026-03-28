import { cleanupOldActivities, markOfflineDevices } from "../db";

// Cleanup old activities every hour
setInterval(async () => {
  try {
    const deleted = await cleanupOldActivities();
    if (deleted > 0) {
      console.log(`[cleanup] Deleted ${deleted} old activity records`);
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
