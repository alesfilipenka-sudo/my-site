# Auth setup — что нужно сделать руками

После пуша этих изменений на Netlify нужно выполнить три разовые задачи.
Без них `/admin` не заработает: redirect → /login, кнопка GitHub → 500.

---

## 1. Создать GitHub OAuth App

1. https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.
2. Заполнить:
   - **Application name:** `alesfilipenka admin` (любое)
   - **Homepage URL:** `https://alesfilipenka.xyz`
   - **Authorization callback URL:** `https://alesfilipenka.xyz/.netlify/functions/auth-callback`
3. **Register application**.
4. Скопировать **Client ID**.
5. Нажать **Generate a new client secret** → скопировать секрет (показывается один раз).

> Для локальной разработки добавь второй callback `http://localhost:8888/.netlify/functions/auth-callback`
> в той же OAuth App (GitHub разрешает несколько). Или сделай вторую App для dev.

---

## 2. Создать новый GitHub Personal Access Token (для серверной записи)

Старый `VITE_GITHUB_TOKEN` теперь **скомпрометирован** (он лежал в bundle публично).
**Удали его в GitHub** и создай новый — он будет жить только на сервере.

1. https://github.com/settings/personal-access-tokens/new (Fine-grained PAT).
2. **Repository access:** Only select repositories → **`my-site`**.
3. **Repository permissions:** **Contents → Read and write**.
4. **Expiration:** на твой вкус (90 дней / 1 год).
5. Generate → скопировать токен.

---

## 3. Прописать env-переменные в Netlify

Netlify dashboard → Site → **Site configuration → Environment variables** → **Add a variable** для каждой:

| Имя                          | Значение                                                          |
|------------------------------|-------------------------------------------------------------------|
| `GITHUB_OAUTH_CLIENT_ID`     | Client ID из шага 1                                               |
| `GITHUB_OAUTH_CLIENT_SECRET` | Client secret из шага 1                                           |
| `GITHUB_REPO_TOKEN`          | Fine-grained PAT из шага 2                                        |
| `JWT_SECRET`                 | Любая длинная случайная строка (≥32 символа). Сгенерировать ниже  |
| `ADMIN_USERS`                | `alesfilipenka-sudo` (твой GitHub login). Через запятую можно ещё |

**Удалить:** старую переменную `VITE_GITHUB_TOKEN` (теперь не используется).

Сгенерировать `JWT_SECRET` в PowerShell:
```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```
Или в bash:
```bash
openssl rand -base64 48
```

После добавления переменных → **Deploys → Trigger deploy → Clear cache and deploy site**.
Без передеплоя Functions не подхватят новые env.

---

## 4. Локальная разработка (опционально)

```bash
npm install            # подтянуть jsonwebtoken
npm install -g netlify-cli
netlify login
netlify link           # привязать к Netlify-сайту
netlify dev            # стартует Vite + Functions на http://localhost:8888
```

Netlify CLI сам подтянет env-переменные с сайта. Открой `http://localhost:8888/admin`.

---

## Что получилось

- `/admin` обёрнут в `ProtectedRoute`. Без сессии → редирект на `/login`.
- `/login` показывает кнопку «Continue with GitHub».
- OAuth flow: `auth-login` → GitHub → `auth-callback` → выпуск JWT в HttpOnly cookie → редирект на `/admin`.
- Сохранение контента идёт через `/.netlify/functions/save-content`, который проверяет JWT и роль `admin`. Прямые запросы к GitHub API из браузера больше не работают — токен на сервере.
- В админке справа сверху — аватар + меню с Logout (clear cookie + redirect на `/`).
- Если кто-то с валидным GitHub-аккаунтом, но не из `ADMIN_USERS`, попробует залогиниться — `auth-callback` вернёт `403`.

## Известные ограничения

- Сессия живёт 7 дней (`SESSION_TTL` в `_lib.js`). После истечения — вернёт `auth-me: 401` и фронт сам отправит на `/login`.
- При смене `JWT_SECRET` все активные сессии инвалидируются — это by design.
- `Site.jsx` всё ещё фильтрует контент `data.cases.filter(c => !c.hidden)` — работает на любом content.json без поля `hidden`.
