const express = require('express');
const bodyParser = require('body-parser');
const { get_StripeSession } = require('../controllers/stripe_control');

const router = express.Router();
const jsonParse = bodyParser.json();

router.post('/create-session',jsonParse,get_StripeSession);

module.exports = router;