const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '.', 'pousada.db');

function getConnection() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar na DB', err.message);
    } else {
      console.log('Conexão ao BancoSQLITE OK!');
    }
  });
}

module.exports = getConnection;
