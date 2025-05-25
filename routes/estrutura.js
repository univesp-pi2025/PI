const express = require('express');
const path = require('path');
const router = express.Router();

// renderiza a página estática
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'estrutura.html'));
});

module.exports = router;