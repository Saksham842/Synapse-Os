import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynapseOS | Game-Theoretic Resource Allocator & Swarm Trust Layer",
  description:
    "Autonomous Queen-Agent CPU Allocation via Nash Bargaining Solution and P2P Reputation Trust Verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#10142B] text-[#F5F6FA]">
        {children}
      </body>
    </html>
  );
}
