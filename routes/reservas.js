const express = require('express');
const router = express.Router();
const getConnection = require('../db/connection');

// listar todas reservas
router.get('/', (req, res) => {
  const db = getConnection();

  db.all('SELECT * FROM Reserva', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar reservas', details: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

// GET /reservas/:id - uma reserva
router.get('/:id', (req, res) => {
  const db = getConnection();

  db.get('SELECT * FROM Reserva WHERE IDReserva = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar reserva', details: err.message });
    } else {
      res.json(row || {});
    }
    db.close();
  });
});

// criar nova reserva e marcar quarto como inativo
router.post('/', (req, res) => {
  const { IDQuarto, DataEntrada, DataSaida, Status_pagamento, condicoes, IDHospede } = req.body;
  const db = getConnection();

  if (!IDHospede || !IDQuarto) {
    db.close();
    return res.status(400).json({ error: 'ID do Hóspede e Quarto são obrigatórios.' });
  }

  db.serialize(() => {
    const sqlInsert = `
      INSERT INTO Reserva (IDQuarto, DataEntrada, DataSaida, Status_pagamento, condicoes, IDHospede)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlInsert, [IDQuarto, DataEntrada, DataSaida, Status_pagamento, condicoes, IDHospede], function (err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Erro ao criar reserva', details: err.message });
      }

      // Se o quarto é reservado = Inativo
      const sqlUpdateQuarto = 'UPDATE Quarto SET Ativo = 0 WHERE id_quarto = ?';

      db.run(sqlUpdateQuarto, [IDQuarto], function (err2) {
        if (err2) {
          db.close();
          return res.status(500).json({
            error: 'Reserva criada, mas erro ao marcar quarto como inativo',
            details: err2.message
          });
        }

        db.get('SELECT * FROM Reserva WHERE IDReserva = ?', [this.lastID], (err3, novaReserva) => {
          db.close();
          if (err3) {
            return res.status(500).json({
              error: 'Reserva criada, mas erro ao retornar os dados',
              details: err3.message
            });
          }

          res.status(201).json({
            message: 'Reserva criada com sucesso e quarto marcado como inativo',
            reserva: novaReserva
          });
        });
      });
    });
  });
});

// Atualizamos as reservas com esse put
router.put('/:id', (req, res) => {
  const { IDQuarto, DataEntrada, DataSaida, Status_pagamento, condicoes, IDHospede } = req.body;
  const db = getConnection();

  const sql = `
    UPDATE Reserva
    SET IDQuarto = ?, DataEntrada = ?, DataSaida = ?, Status_pagamento = ?, condicoes = ?, IDHospede = ?
    WHERE IDReserva = ?
  `;

  db.run(sql, [IDQuarto, DataEntrada, DataSaida, Status_pagamento, condicoes, IDHospede, req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar reserva', details: err.message });
    } else {
      res.json({ message: 'Reserva atualizada com sucesso' });
    }
    db.close();
  });
});

// função pra excluir a reserva
router.delete('/:id', (req, res) => {
  const db = getConnection();

  db.run('DELETE FROM Reserva WHERE IDReserva = ?', [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao excluir reserva', details: err.message });
    } else {
      res.json({ message: 'Reserva excluída com sucesso' });
    }
    db.close();
  });
});

module.exports = router;