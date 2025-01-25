const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wallet_app'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
// User Login
app.post('/login', (req, res) => {
    const { username, password, accountType } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND account_type = ?';
    db.query(query, [username, password, accountType], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            res.send({ success: true, message: 'Login successful', user: results[0] });
        } else {
            res.send({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Add Transaction
app.post('/add-transaction', (req, res) => {
    const { account, amount, category, subcategory, description } = req.body;

    const query = 'INSERT INTO transactions (account, amount, category, subcategory, description) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [account, amount, category, subcategory, description], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.send({ success: true, message: 'Transaction added successfully' });
    });
});

// Get Transaction Summary
app.get('/transactions-summary', (req, res) => {
    const query = 'SELECT category, SUM(amount) AS total_amount FROM transactions GROUP BY category';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.send(results);
    });
});

// Notification for Budget Exceeding
app.get('/check-budget', (req, res) => {
    const query = 'SELECT SUM(amount) AS total_expenses FROM transactions';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        const totalExpenses = results[0].total_expenses;
        const budget = 1000; // Example budget limit

        if (totalExpenses > budget) {
            res.send({ exceeded: true, message: 'Budget exceeded' });
        } else {
            res.send({ exceeded: false, message: 'Within budget' });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
