import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(3001, '0.0.0.0', () => console.log('Server started on 3001'));