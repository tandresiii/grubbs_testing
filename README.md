# Infiniti Inbound Call Assessment

Timed web assessment for Infiniti sales staff. 40 questions, 25 minutes, four sections (phone etiquette, product knowledge, lead qualification, objection handling). Test takers enter a shared access code; results persist to Postgres; admin dashboard shows all submissions with per-question review and CSV export.

## Routes

| Path           | Who             | Purpose                                    |
|----------------|-----------------|--------------------------------------------|
| `/`            | Candidates      | The test itself — access code gated        |
| `/admin`       | You             | Login + dashboard + per-submission review  |
| `/healthz`     | Railway         | Health check                               |

## Required environment variables

| Var                 | Example                                    | Notes |
|---------------------|--------------------------------------------|-------|
| `DATABASE_URL`      | auto                                       | Provided by Railway's Postgres add-on |
| `SESSION_SECRET`    | `c9f2…` (32+ random bytes)                 | Signs session cookies |
| `TEST_ACCESS_CODE`  | `E360-2026`                                | Shared passcode reps enter to start |
| `ADMIN_USERNAME`    | `admin`                                    | |
| `ADMIN_PASSWORD`    | `…`                                        | Pick something strong |
| `NODE_ENV`          | `production`                               | Set on Railway |

Generate a session secret locally with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploy to Railway

1. Create a new GitHub repo and push this folder:
   ```bash
   git init && git add . && git commit -m "Initial"
   gh repo create infiniti-call-assessment --private --source=. --push
   ```
2. In Railway → **New Project → Deploy from GitHub repo** → select it.
3. In the same project → **New → Database → PostgreSQL**.
4. On the web service → **Variables**, add:
   - `DATABASE_URL` → click *Reference* → `Postgres.DATABASE_URL`
   - `SESSION_SECRET`, `TEST_ACCESS_CODE`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` → values
   - `NODE_ENV` → `production`
5. **Settings → Networking → Generate Domain** to get a public URL.
6. Visit `/admin` to sign in. Visit `/` and use the access code to take the test.

The `assessments` table and the session table are created automatically on first boot.

## Run locally

```bash
# Requires Postgres running locally
cp .env.example .env   # then fill in values
createdb infiniti_assessment
npm install
npm start
```

## Editing questions

All questions live in `questions.js`. Edit, commit, push — Railway redeploys automatically. Historical submissions keep their original scored answers since the full question+explanation is stored per-submission in the DB.

## Rotating the access code

Change `TEST_ACCESS_CODE` in Railway variables → redeploys in ~30s.
