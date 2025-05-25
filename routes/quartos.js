const express = require('express');
const router = express.Router();
const getConnection = require('../db/connection');

// quartos
router.get('/', (req, res) => {
  const db = getConnection();

  const query = `
    SELECT id_quarto AS id, QuartoNum AS numero, Ativo
    FROM Quarto
    WHERE Ativo != 0
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('[ERRO QUARTOS]', err.message);
      res.status(500).json({ error: 'Erro ao buscar quartos', details: err.message });
    } else {
      res.json(rows);
    }

    db.close((err) => {
      if (err) console.error('Erro ao fechar o banco:', err.message);
    });
  });
});

module.exports = router;