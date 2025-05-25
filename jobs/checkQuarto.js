const cron = require('node-cron');
const getConnection = require('../db/connection');

// Roda a cada x minutos, pra mudar os mins basta alterar o INT que está na primeira casa do cron.schedule :) Por padrão vou deixar 3 minutos
cron.schedule('*/3 * * * *', () => {
  console.log('[CRON] Verificando check-outs vencidos...');
  const db = getConnection();

  const hoje = new Date().toISOString().split('T')[0]; // formato: YYYY-MM-DD

  // Busca reservas que já terminaram
  const sql = `
    SELECT IDQuarto FROM Reserva
    WHERE DATE(DataSaida) <= DATE(?) AND IDQuarto IN (
      SELECT id_quarto FROM Quarto WHERE Ativo = 0
    )
  `;

  db.all(sql, [hoje], (err, rows) => {
    if (err) {
      console.error('[CRON] Erro ao buscar quartos com checkout vencido:', err.message);
      return db.close();
    }

    if (rows.length === 0) {
      console.log('[CRON] Nenhum quarto liberado.');
      return db.close();
    }

    const quartosLiberados = rows.map(r => r.IDQuarto);
    const placeholders = quartosLiberados.map(() => '?').join(',');

    const updateSQL = `UPDATE Quarto SET Ativo = 1 WHERE id_quarto IN (${placeholders})`;

    db.run(updateSQL, quartosLiberados, function (err2) {
      if (err2) {
        console.error('[CRON] Erro ao liberar quartos:', err2.message);
      } else {
        console.log(`[CRON] ${this.changes} quarto(s) liberado(s).`);
      }
      db.close();
    });
  });
});
