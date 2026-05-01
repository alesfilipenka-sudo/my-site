import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import AdminSkeleton from "./AdminSkeleton";

/**
 * Оборачивает защищённый роут.
 * Пока идёт проверка cookie — показывает скелетон админки.
 * Если не авторизован или нет роли "admin" — редирект на /login с сохранением returnTo.
 */
export default function ProtectedRoute({ children, role = "admin" }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <AdminSkeleton />;

  if (!user || (role && user.role !== role)) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return children;
}
