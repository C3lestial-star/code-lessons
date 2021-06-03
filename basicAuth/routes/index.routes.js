const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/', (req, res) => {
  console.log(req.session.id)
  res.render('index', { title: 'App created with Ironhack generator 🚀' })});

module.exports = router;
