import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} requiredRole="ADMIN">
      {children}
    </AuthGuard>
  );
}
