const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'hey25',
    resave: false,
    saveUninitialized: true,
}));

// MySQL Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Mugisha123@#', 
    database: 'auth_system'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Authentication System');
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        // Store user in the database
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Retrieve user from database
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];

            // Compare passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    // Set session
                    req.session.user = user;
                    res.send('Login successful');
                } else {
                    res.send('Invalid email or password');
                }
            });
        } else {
            res.send('Invalid email or password');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        res.send('Logged out successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
