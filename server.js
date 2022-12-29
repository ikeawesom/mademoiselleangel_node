const express = require('express');
const path = require('path');
const { signOut } = require('./controllers/firebase_control')

const app = express();
app.use(express.static(__dirname+'/public'));
const PORT = process.env.PORT || 80

// const publicDir = path.join(__dirname,'./public');
// console.log(publicDir);


app.set('view engine','hbs');

// --------- Backend Processes --------- //

app.use('/firebaseProcess',require('./routes/firebase'));
app.use('/',require('./routes/pages'))
app.use('/stripe',require('./routes/stripe'))

// --------- Get to pages --------- //

app.get('/', (req,res) => {
    signOut.signOut();
    res.render('index');
})

app.get('/paynow',(req,res) => {
    signOut.signOut();
    res.render('paynow');
})

app.get('/admin/login', (req,res) => {
    res.render('admin/login')
})

app.get('/admin/dashboard', (req,res) => {
    res.render('admin/dashboard')
})

app.get('/admin/dashboard/product', (req,res)=>{
    res.render('admin/dashboard/product')
})

app.get('/admin/dashboard/order', (req,res)=>{
    res.render('admin/dashboard/order');
})

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})