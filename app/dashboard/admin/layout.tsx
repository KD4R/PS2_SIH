import type { Metadata } from "next";

export const metadata: Metadata = { title: "Programme administration" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
