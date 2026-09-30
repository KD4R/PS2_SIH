import type { Metadata } from "next";

export const metadata: Metadata = { title: "Department dashboard" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
