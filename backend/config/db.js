const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      
  password: '',      
  database: 'garbage_db' 
});

db.connect(err => {
  if (err) console.log('Database connecting error: ' + err);
  else console.log('Database connected!');
});

module.exports = db;