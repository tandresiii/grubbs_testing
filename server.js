/**
 * Infiniti Inbound Call Assessment — server
 *
 * Serves the test UI, validates the shared access code, scores submissions
 * server-side, stores results in Postgres, and exposes an admin dashboard
 * behind a single-admin login (credentials from env vars).
 *
 * Required env vars (Railway sets DATABASE_URL and PORT automatically):
 *   DATABASE_URL         Postgres connection string
 *   SESSION_SECRET       random string used to sign session cookies
 *   TEST_ACCESS_CODE     shared passcode reps must enter to start the test
 *   ADMIN_USERNAME       admin login username
 *   ADMIN_PASSWORD       admin login password
 */

const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const { QUESTIONS, SECTIONS, clientQuestions, score } = require('./questions');

// ---------- config ----------
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set.');
  process.exit(1);
}
if (!process.env.TEST_ACCESS_CODE || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error('FATAL: TEST_ACCESS_CODE, ADMIN_USERNAME, and ADMIN_PASSWORD must be set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres requires SSL; use rejectUnauthorized:false because
  // Railway's internal cert chain isn't in Node's default roots.
  ssl: IS_PROD ? { rejectUnauthorized: false } : false,
});

// ---------- schema ----------
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id               SERIAL PRIMARY KEY,
      candidate_name   TEXT NOT NULL,
      candidate_id     TEXT,
      correct_count    INTEGER NOT NULL,
      total_questions  INTEGER NOT NULL,
      section_scores   JSONB NOT NULL,
      scored_answers   JSONB NOT NULL,
      flagged          JSONB,
      duration_seconds INTEGER NOT NULL,
      time_expired     BOOLEAN DEFAULT FALSE,
      submitted_at     TIMESTAMPTZ DEFAULT NOW(),
      ip_address       TEXT,
      user_agent       TEXT
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS assessments_submitted_at_idx ON assessments (submitted_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS assessments_candidate_name_idx ON assessments (candidate_name)`);
  console.log('DB ready.');
}

// ---------- app ----------
const app = express();
app.set('trust proxy', 1); // Railway proxies, needed for secure cookies to work
app.use(express.json({ limit: '512kb' }));

app.use(session({
  store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
}));

// ---------- helpers ----------
function safeCompare(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function csvEscape(v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (/["\n,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ==========================================================
// PUBLIC ROUTES — candidate-facing
// ==========================================================

/**
 * POST /api/test/start
 * Body: { accessCode, name, candidateId }
 * Validates the shared access code, stores candidate info in the session,
 * returns the question bank (without correct answers or explanations).
 */
app.post('/api/test/start', (req, res) => {
  const { accessCode, name, candidateId } = req.body || {};
  if (!accessCode || !safeCompare(accessCode, process.env.TEST_ACCESS_CODE)) {
    return res.status(401).json({ error: 'Invalid access code' });
  }
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required' });
  }
  req.session.testStarted = true;
  req.session.candidateName = name.trim().slice(0, 120);
  req.session.candidateId = (candidateId || '').trim().slice(0, 60) || null;
  req.session.testStartedAt = Date.now();
  res.json({
    ok: true,
    questions: clientQuestions(),
    sections: SECTIONS,
    totalSeconds: 25 * 60,
  });
});

/**
 * POST /api/test/submit
 * Body: { answers: (number|null)[], flagged: number[], durationSeconds, timeExpired }
 * Requires an active session from /api/test/start. Scores server-side,
 * persists, returns full scored results (including correct answers + why).
 */
app.post('/api/test/submit', async (req, res) => {
  if (!req.session || !req.session.testStarted) {
    return res.status(401).json({ error: 'No active test session' });
  }
  const { answers, flagged, durationSeconds, timeExpired } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return res.status(400).json({ error: 'Invalid answers payload' });
  }

  // Coerce answers to numbers or null, reject anything else.
  const cleanAnswers = answers.map((a) => {
    if (a === null || a === undefined) return null;
    const n = Number(a);
    return Number.isInteger(n) && n >= 0 && n < 10 ? n : null;
  });

  const { correctCount, totalQuestions, sectionScores, scored } = score(cleanAnswers);

  try {
    const result = await pool.query(
      `INSERT INTO assessments
        (candidate_name, candidate_id, correct_count, total_questions,
         section_scores, scored_answers, flagged, duration_seconds, time_expired,
         ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, submitted_at`,
      [
        req.session.candidateName,
        req.session.candidateId,
        correctCount,
        totalQuestions,
        JSON.stringify(sectionScores),
        JSON.stringify(scored),
        JSON.stringify(Array.isArray(flagged) ? flagged : []),
        Number.isFinite(durationSeconds) ? Math.max(0, Math.round(durationSeconds)) : 0,
        !!timeExpired,
        req.ip,
        (req.headers['user-agent'] || '').slice(0, 500),
      ]
    );

    // Clear test-session so the same session can't re-submit.
    req.session.testStarted = false;

    res.json({
      id: result.rows[0].id,
      submittedAt: result.rows[0].submitted_at,
      candidateName: req.session.candidateName,
      candidateId: req.session.candidateId,
      correctCount,
      totalQuestions,
      sectionScores,
      scored,
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

// ==========================================================
// ADMIN ROUTES
// ==========================================================

app.get('/api/admin/status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const ok =
    username &&
    password &&
    safeCompare(username, process.env.ADMIN_USERNAME) &&
    safeCompare(password, process.env.ADMIN_PASSWORD);
  if (!ok) return res.status(401).json({ error: 'Invalid username or password' });
  req.session.isAdmin = true;
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  if (req.session) req.session.destroy(() => res.json({ ok: true }));
  else res.json({ ok: true });
});

/** Summary stats for the dashboard header */
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const q = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COALESCE(ROUND(AVG(correct_count::numeric / NULLIF(total_questions,0) * 100), 1), 0) AS avg_pct,
        COALESCE(SUM(CASE WHEN correct_count::numeric / NULLIF(total_questions,0) >= 0.75 THEN 1 ELSE 0 END), 0)::int AS pass_count,
        COALESCE(SUM(CASE WHEN submitted_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END), 0)::int AS this_week
      FROM assessments
    `);
    res.json(q.rows[0]);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

/** List assessments with optional name search and date filters */
app.get('/api/admin/assessments', requireAdmin, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const where = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      where.push(`(candidate_name ILIKE $${params.length} OR candidate_id ILIKE $${params.length})`);
    }
    if (from) {
      params.push(from);
      where.push(`submitted_at >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      where.push(`submitted_at <= $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const q = await pool.query(
      `SELECT id, candidate_name, candidate_id, correct_count, total_questions,
              section_scores, duration_seconds, time_expired, submitted_at
       FROM assessments ${whereSql}
       ORDER BY submitted_at DESC
       LIMIT 500`,
      params
    );
    res.json({ assessments: q.rows });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to load assessments' });
  }
});

/** Full detail for one assessment (for the review modal) */
app.get('/api/admin/assessments/:id', requireAdmin, async (req, res) => {
  try {
    const q = await pool.query('SELECT * FROM assessments WHERE id = $1', [req.params.id]);
    if (q.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ assessment: q.rows[0], sections: SECTIONS });
  } catch (err) {
    console.error('Detail error:', err);
    res.status(500).json({ error: 'Failed to load assessment' });
  }
});

app.delete('/api/admin/assessments/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM assessments WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

/** CSV export of all assessments (respects optional search/date filters) */
app.get('/api/admin/export.csv', requireAdmin, async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const where = [];
    const params = [];
    if (search) { params.push(`%${search}%`); where.push(`(candidate_name ILIKE $${params.length} OR candidate_id ILIKE $${params.length})`); }
    if (from)   { params.push(from); where.push(`submitted_at >= $${params.length}`); }
    if (to)     { params.push(to);   where.push(`submitted_at <= $${params.length}`); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const q = await pool.query(
      `SELECT id, candidate_name, candidate_id, correct_count, total_questions,
              section_scores, duration_seconds, time_expired, submitted_at
       FROM assessments ${whereSql}
       ORDER BY submitted_at DESC`,
      params
    );
    const header = ['ID','Name','Candidate ID','Submitted At','Score','Total','Percent',
                    'Section A','Section B','Section C','Section D','Duration (sec)','Time Expired'];
    const lines = [header.map(csvEscape).join(',')];
    for (const r of q.rows) {
      const s = r.section_scores || {};
      const cell = (k) => s[k] ? `${s[k].correct}/${s[k].total}` : '0/0';
      const pct = r.total_questions ? ((r.correct_count / r.total_questions) * 100).toFixed(1) : '0';
      lines.push([
        r.id, r.candidate_name, r.candidate_id || '',
        new Date(r.submitted_at).toISOString(),
        r.correct_count, r.total_questions, pct,
        cell('A'), cell('B'), cell('C'), cell('D'),
        r.duration_seconds, r.time_expired ? 'yes' : 'no',
      ].map(csvEscape).join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="assessments-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(lines.join('\n'));
  } catch (err) {
    console.error('CSV error:', err);
    res.status(500).send('Failed to generate CSV');
  }
});

// ==========================================================
// STATIC
// ==========================================================

// Admin SPA — served fresh, no cache, so updates roll out immediately.
app.get('/admin', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public'), {
  index: 'index.html',
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store'),
}));

// Health check for Railway
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ---------- start ----------
initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Listening on :${PORT} (${IS_PROD ? 'production' : 'development'})`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
