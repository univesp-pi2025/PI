const express = require('express');
require('./jobs/checkQuarto');
const cors = require('cors');

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('public')); 


app.use('/quartos', require('./routes/quartos'));     
app.use('/hospedes', require('./routes/hospedes'));   
app.use('/reservas', require('./routes/reservas'));
app.use('/contato', require('./routes/contato'))
app.use('/estrutura', require('./routes/estrutura'))

// Catch de erro abaixo
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});
// Se der certo vai exibir abaixo v
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});