// app.js
const express = require('express');
const dbPool = require('./db'); // Import the pool created above

const app = express();
app.use(express.json());

// An async Express route to fetch all users
app.get('/users', async (req, res) => {
  try {
    // Acquire a connection from the pool and run a query
    const [rows, fields] = await dbPool.execute('SELECT * FROM users');
    
    // Send the results as a JSON response
    res.status(200).json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Server error');
  }
});

// An async Express route to fetch a user by ID
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    // Use parameter binding (?) to prevent SQL injection
    const [rows] = await dbPool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Server error');
  }
});


app.listen(3000, () => console.log('Server started on port 3000'));