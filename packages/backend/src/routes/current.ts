import { getAllDeviceStates, getRecentActivities } from "../db";
import type { DeviceState, ActivityRecord } from "../types";
import { visitors } from "../services/visitors";

// Prepare records for public API: strip window_title, parse extra JSON
function preparePublicDevices(devices: any[]) {
  return devices.map(({ window_title, extra, ...rest }) => {
    let parsedExtra: Record<string, unknown> = {};
    try {
      parsedExtra = extra ? JSON.parse(extra as string) : {};
    } catch {
      // Malformed JSON — ignore
    }
    return { ...rest, extra: parsedExtra };
  });
}

function stripWindowTitle<T extends { window_title?: string }>(
  records: T[]
): Omit<T, "window_title">[] {
  return records.map(({ window_title, ...rest }) => rest);
}

export async function handleCurrent(clientIp: string, userAgent?: string): Promise<Response> {
  visitors.heartbeat(clientIp, userAgent);

  const devices = await getAllDeviceStates();
  const recentActivities = await getRecentActivities();

  return Response.json({
    devices: preparePublicDevices(devices),
    recent_activities: stripWindowTitle(recentActivities as any[]),
    server_time: new Date().toISOString(),
    viewer_count: visitors.getCount(),
  });
}
