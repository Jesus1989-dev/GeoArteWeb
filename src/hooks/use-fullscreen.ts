"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFullscreen<T extends HTMLElement>(targetRef: RefObject<T | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  const enter = useCallback(async () => {
    const el = targetRef.current;
    if (!el || document.fullscreenElement) return;
    await el.requestFullscreen();
  }, [targetRef]);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return;
    await document.exitFullscreen();
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement === targetRef.current) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit, targetRef]);

  return { isFullscreen, enter, exit, toggle };
}
