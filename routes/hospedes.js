const express = require('express');
const router = express.Router();
const getConnection = require('../db/connection');

//listar todos os hóspedes
router.get('/', (req, res) => {
  const db = getConnection();

  db.all('SELECT * FROM Hospede', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar hóspedes', details: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
});

//  hóspede específico
router.get('/:id', (req, res) => {
  const db = getConnection();

  db.get('SELECT * FROM Hospede WHERE id_Hospede = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar hóspede', details: err.message });
    } else {
      res.json(row || {});
    }
    db.close();
  });
});

// criar novo hóspede OU reutilizar se CPF já existe
router.post('/', (req, res) => {
  const { Nome, Documento, Telefone, Email, Endereco } = req.body;
  const db = getConnection();

  // Verifica se o CPF já está cadastrado
  db.get('SELECT * FROM Hospede WHERE Documento = ?', [Documento], (err, row) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Erro ao verificar CPF', details: err.message });
    }

    if (row) {
      // Já existe, retorna esse hóspede
      db.close();
      return res.status(200).json({ message: 'Hóspede já cadastrado', hospede: row });
    }

    // Insere novo hóspede
    const sql = `
      INSERT INTO Hospede (Nome, Documento, Telefone, Email, Endereco)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [Nome, Documento, Telefone, Email, Endereco], function (err2) {
      if (err2) {
        db.close();
        return res.status(500).json({ error: 'Erro ao criar hóspede', details: err2.message });
      }

      db.get('SELECT * FROM Hospede WHERE id_Hospede = ?', [this.lastID], (err3, novoHospede) => {
        db.close();
        if (err3) {
          return res.status(500).json({ error: 'Erro ao retornar hóspede criado', details: err3.message });
        }

        res.status(201).json({ message: 'Hóspede criado com sucesso', hospede: novoHospede });
      });
    });
  });
});

// atualizar hóspede
router.put('/:id', (req, res) => {
  const { Nome, Documento, Telefone, Email, Endereco } = req.body;
  const db = getConnection();

  const sql = `
    UPDATE Hospede
    SET Nome = ?, Documento = ?, Telefone = ?, Email = ?, Endereco = ?
    WHERE id_Hospede = ?
  `;

  db.run(sql, [Nome, Documento, Telefone, Email, Endereco, req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar hóspede', details: err.message });
    } else {
      res.json({ message: 'Hóspede atualizado com sucesso' });
    }
    db.close();
  });
});

// remover hóspede
router.delete('/:id', (req, res) => {
  const db = getConnection();

  db.run('DELETE FROM Hospede WHERE id_Hospede = ?', [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao remover hóspede', details: err.message });
    } else {
      res.json({ message: 'Hóspede removido com sucesso' });
    }
    db.close();
  });
});

module.exports = router;