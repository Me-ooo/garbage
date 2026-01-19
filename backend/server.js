const exprss = require('express');
const core = require('cors');
const path = require('path');
const app = exprss();

app.use(core());
app.use(exprss.json());
app.use('/uploads', exprss.static(path.join(__dirname, 'uploads')));

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));