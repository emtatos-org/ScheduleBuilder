import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Skapa tabell vid uppstart
pool.query(`
  CREATE TABLE IF NOT EXISTS schedules (
    sync_code VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);

// Hämta schema
app.get('/api/sync/:code', async (req, res) => {
  const { code } = req.params;
  const result = await pool.query(
    'SELECT data, updated_at FROM schedules WHERE sync_code = $1',
    [code.toUpperCase()]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Koden finns inte' });
  }
  res.json(result.rows[0]);
});

// Spara schema
app.put('/api/sync/:code', async (req, res) => {
  const { code } = req.params;
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Data saknas' });

  await pool.query(
    `INSERT INTO schedules (sync_code, data, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (sync_code) DO UPDATE SET data = $2, updated_at = NOW()`,
    [code.toUpperCase(), JSON.stringify(data)]
  );
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on port ${port}`));
