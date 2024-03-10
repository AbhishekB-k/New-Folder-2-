const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.USERNAME,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PG_PORT,
});

app.post('/courses', async (req, res) => {
    const { instructor_id, name, max_seats, start_date } = req.body;
    try {
        const result = await pool.query('INSERT INTO courses (instructor_id, name, max_seats, start_date) VALUES ($1, $2, $3, $4) RETURNING *', [instructor_id, name, max_seats, start_date]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/courses/:id', async (req, res) => {
    const courseId = parseInt(req.params.id);
    const { name, max_seats, start_date } = req.body;
    try {
        const result = await pool.query('UPDATE courses SET name = $1, max_seats = $2, start_date = $3 WHERE id = $4 RETURNING *', [name, max_seats, start_date, courseId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Course not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/courses/:courseId/leads', async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const { name, email, phone_number, linkedin_profile } = req.body;
    try {
        const result = await pool.query('INSERT INTO leads (course_id, name, email, phone_number, linkedin_profile, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [courseId, name, email, phone_number, linkedin_profile, 'Pending']);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error registering lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/leads/:id', async (req, res) => {
    const leadId = parseInt(req.params.id);
    const { status } = req.body;
    try {
        const result = await pool.query('UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [status, leadId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Lead not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/leads', async (req, res) => {
    const { name, email } = req.query;
    try {
        let query = 'SELECT * FROM leads';
        const values = [];
        if (name) {
            query += ' WHERE name LIKE $1';
            values.push(`%${name}%`);
        }
        if (email) {
            query += name ? ' AND' : ' WHERE';
            query += ' email = $2';
            values.push(email);
        }
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching leads:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/leads/:leadId/comments', async (req, res) => {
    const leadId = parseInt(req.params.leadId);
    const { comment } = req.body;
    try {
        const result = await pool.query('INSERT INTO comments (lead_id, comment) VALUES ($1, $2) RETURNING *', [leadId, comment]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
