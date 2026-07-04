require('dotenv').config();
const app = require('./src/app');
const { getDb } = require('./src/database/db');

const port = process.env.PORT || 3000;

getDb()
  .then(() => {
    app.listen(port, () => console.log(`🚀 Viva Novela API rodando na porta ${port}`));
  })
  .catch(err => {
    console.error('Falha ao conectar no banco de dados SQLite:', err);
    process.exit(1);
  });
