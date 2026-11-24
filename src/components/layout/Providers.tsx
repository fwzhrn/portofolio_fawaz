"use client";

import { MotionConfig } from "motion/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user": semua animasi Motion otomatis hormati
  // pengaturan "kurangi gerakan" di perangkat user.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}