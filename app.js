var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;

app.use('/' , function(req , res){
    res.send('Hi There');
});

app.listen(PORT , function(){
    console.log('listning port' + PORT + '!');
})