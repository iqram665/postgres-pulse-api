const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json()); // To receive JSON data

const PORT = 3000;

//1. Database file creation and connection (no need to install any extra software)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('📦 Connection to SQLite database successful!');
        
        // Create user table (if it doesn't exist)
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (tableErr) => {
            if (tableErr) console.error('টেবিল তৈরিতে সমস্যা:', tableErr.message);
            else console.log('📋 Users টেবিল রেডি আছে।');
        });
    }
});

// 2. API route: Create a new user (POST)
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are both required!' });
    }

    const query = `INSERT INTO users (name, email) VALUES (?, ?)`;
    db.run(query, [name, email], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Email duplicate or server problem!' });
        }
        
        res.status(201).json({
            message: 'User created successfully!',
            user: { id: this.lastID, name, email }
        });
    });
});

// 3. API route: View all users (GET)
app.get('/users', (req, res) => {
    const query = `SELECT * FROM users ORDER BY id ASC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch user data!' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
});