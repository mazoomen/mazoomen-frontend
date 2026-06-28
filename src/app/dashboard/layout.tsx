export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add shared sidebar navigation & auth guard here
  return <div className="min-h-screen">{children}</div>;
}
