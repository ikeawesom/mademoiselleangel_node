const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

const publicDir = path.join(__dirname,'./public');
app.use(express.static(publicDir));

app.set('view engine','hbs');

app.get('/', (req,res) => {
    res.render('index');
})

app.get('/cart', (req,res) => {
    res.render('cart');
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})