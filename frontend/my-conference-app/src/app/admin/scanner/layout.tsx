import { AuthGuard } from "@/components/auth/auth-guard";

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="ADMIN">
      {children}
    </AuthGuard>
  );
}
