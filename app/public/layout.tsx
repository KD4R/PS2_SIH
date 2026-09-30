import type { Metadata } from "next";

export const metadata: Metadata = { title: "Public transparency portal" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
