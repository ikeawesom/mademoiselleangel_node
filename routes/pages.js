const express = require('express');
const { home_control, cart_control, products_control, maintenance_control, paynow_control, success_control } = require('../controllers/pages_control');

const router = express.Router();

router.get('/cart',cart_control);
router.get('/products',products_control);
router.get('/maintenance',maintenance_control);
// router.get('/paynow',paynow_control);
router.get('/success',success_control);

module.exports = router;