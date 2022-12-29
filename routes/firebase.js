const express = require('express');
const { allProducts_control, lastOrder_control,
    newsletter_control, paynow_control, login_control,
    auth_control, admin_control, newProduct_control, resetSession_control} = require('../controllers/firebase_control');

const bodyParser = require('body-parser');

const router = express.Router();

const jsonParse = bodyParser.json();

router.get('/get_allProducts',allProducts_control);
router.get('/lastOrder',lastOrder_control);
router.post('/newsletter',jsonParse,newsletter_control);
router.post('/paynow',jsonParse,paynow_control);
router.get('/authenticate',auth_control);
router.post('/login/',jsonParse,login_control);
router.post('/admins',jsonParse,admin_control);
router.get('/newproduct/:dynamic',newProduct_control);
router.get('/resetSession',resetSession_control);

module.exports = router;