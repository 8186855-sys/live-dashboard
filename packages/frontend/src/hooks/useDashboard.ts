"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCurrent,
  fetchTimeline,
  type CurrentResponse,
  type TimelineResponse,
} from "@/lib/api";

const POLL_INTERVAL = 10 * 1000; // 10 seconds

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useDashboard() {
  const [current, setCurrent] = useState<CurrentResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const firstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    let requestId = 0;

    const doFetch = async () => {
      const thisRequest = ++requestId;
      try {
        setError(null);
        if (firstLoad.current) setLoading(true);
        const cur = await fetchCurrent(controller.signal);
        if (!controller.signal.aborted && thisRequest === requestId) {
          setCurrent(cur);
          setViewerCount(cur.viewer_count ?? 0);
          firstLoad.current = false;
        }
      } catch (e) {
        if (!controller.signal.aborted && thisRequest === requestId) {
          setError(e instanceof Error ? e.message : "Failed to fetch data");
        }
      } finally {
        if (!controller.signal.aborted && thisRequest === requestId) {
          setLoading(false);
        }
      }
    };

    firstLoad.current = true;
    doFetch();
    const pollId = setInterval(doFetch, POLL_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(pollId);
    };
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();

    const doFetchTimeline = async () => {
      try {
        const tl = await fetchTimeline(selectedDate, controller.signal);
        if (!controller.signal.aborted) {
          setTimeline(tl);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : "Failed to fetch timeline");
        }
      }
    };

    doFetchTimeline();

    return () => {
      controller.abort();
    };
  }, [selectedDate]);

  const changeDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return { current, timeline, selectedDate, changeDate, loading, error, viewerCount };
}
