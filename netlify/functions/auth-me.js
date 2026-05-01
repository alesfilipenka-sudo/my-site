import { verifySessionFromRequest, json } from "./_lib.js";

/**
 * GET /.netlify/functions/auth-me
 * Возвращает текущего пользователя (если есть валидная сессия) или 401.
 * Используется фронтом для useAuth().
 */
export default async (req) => {
  const session = verifySessionFromRequest(req);
  if (!session) return json({ user: null }, 401);
  return json({
    user: {
      login: session.sub,
      name: session.name,
      avatar: session.avatar,
      role: session.role,
    },
  });
};
