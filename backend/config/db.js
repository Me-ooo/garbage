const myaql = require('mysql2/promise');
const connection = myaql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'my_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
module.exports = connection.promise();
