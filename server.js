const express = require('express');
    const path = require('path');
    const { pool, initDb } = require('./db');
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/students', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/students', async (req, res, next) => {
  try {
    const { name, email, course, class_name, attendance = 100, grade = 0 } = req.body;
    if (![name, email, course, class_name].every(v => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'Preencha nome, e-mail, curso e turma.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO students (name,email,course,class_name,attendance,grade)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), course.trim(), class_name.trim(), attendance, grade]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    next(e);
  }
});

app.put('/api/students/:id', async (req, res, next) => {
  try {
    const { name, email, course, class_name, attendance, grade } = req.body;
    const { rows } = await pool.query(
      `UPDATE students SET name=$1,email=$2,course=$3,class_name=$4,attendance=$5,grade=$6
       WHERE id=$7 RETURNING *`,
      [name, email, course, class_name, attendance, grade, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    next(e);
  }
});

app.delete('/api/students/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id=$1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.status(204).end();
  } catch (e) { next(e); }
});


    app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

    app.use((err, _req, res, _next) => {
      console.error(err);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    });

    initDb()
      .then(() => app.listen(PORT, () => console.log(`Gestão Acadêmica rodando em http://localhost:${PORT}`)))
      .catch(err => { console.error('Falha ao iniciar:', err); process.exit(1); });
