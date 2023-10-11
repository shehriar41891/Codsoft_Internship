const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=>{
    res.render('fontPage')
})

app.listen(3000,()=>{
    console.log('The server is listening at the specified port')
})