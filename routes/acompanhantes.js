const express = require('express');
const router = express.Router();
const getConnection = require('../db/connection');
// ESTE CODIGO NÃO ESTÁ IMPLEMENTADO POIS NÃO HOUVE NECESSIDADE DE UTILIZAR DOS ACOMPANHANTES ATÉ AGORA, ESTÁ CRIADO PARA UMA FUTURA NECESSIDADE, NÃO FOI TESTADO AFINCO
// listar todos
router.get('/', (req, res) => {
  const db = getConnection();

  db.all('SELECT * FROM Acompanhante', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar acompanhantes', details: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

//  por reserva
router.get('/reserva/:idReserva', (req, res) => {
  const db = getConnection();

  db.all('SELECT * FROM Acompanhante WHERE idReserva = ?', [req.params.idReserva], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar acompanhantes da reserva', details: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

// criar novo acompanhante
router.post('/', (req, res) => {
  const { idReserva, hospede, Nome, DataNascimento, relacaoDeParentesco } = req.body;
  const db = getConnection();

  const sql = `
    INSERT INTO Acompanhante (idReserva, hospede, Nome, DataNascimento, relacao_parentesco)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [idReserva, hospede, Nome, DataNascimento, relacaoDeParentesco], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao criar acompanhante', details: err.message });
    } else {
      res.status(201).json({ message: 'Acompanhante criado com sucesso', id: this.lastID });
    }
    db.close();
  });
});

// atualizar
router.put('/:codigo', (req, res) => {
  const { idReserva, hospede, Nome, DataNascimento, relacaoDeParentesco } = req.body;
  const db = getConnection();

  const sql = `
    UPDATE Acompanhante
    SET idReserva = ?, hospede = ?, Nome = ?, DataNascimento = ?, relacao_parentesco = ?
    WHERE Código = ?
  `;

  db.run(sql, [idReserva, hospede, Nome, DataNascimento, relacaoDeParentesco, req.params.codigo], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar acompanhante', details: err.message });
    } else {
      res.json({ message: 'Acompanhante atualizado com sucesso' });
    }
    db.close();
  });
});

// remover
router.delete('/:codigo', (req, res) => {
  const db = getConnection();

  db.run('DELETE FROM Acompanhante WHERE Código = ?', [req.params.codigo], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao excluir acompanhante', details: err.message });
    } else {
      res.json({ message: 'Acompanhante removido com sucesso' });
    }
    db.close();
  });
});

module.exports = router;