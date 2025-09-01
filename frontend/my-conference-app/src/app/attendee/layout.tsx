import { AuthGuard } from "@/components/auth/auth-guard";

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} requiredRole="USER">
      <div className="min-h-screen bg-background">{children}</div>
    </AuthGuard>
  );
}
