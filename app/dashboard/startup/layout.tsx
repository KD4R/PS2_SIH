import type { Metadata } from "next";

export const metadata: Metadata = { title: "Innovator dashboard" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
