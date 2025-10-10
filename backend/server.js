require('dotenv').config();
const express = require('express');


const app = express();


// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
