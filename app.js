var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var todos = [];
var todoNext = 1;

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json())

app.get('/' , function(req , res){
    res.send('Hi There');
});

app.get('/todos', function(req , res){
    res.json(todos);
});

app.get('/todo/:id', function(req , res){
    var todoId = parseInt(req.params.id, 10);
    // var todoId = req.params.id;
    var matchTodo;

    todos.forEach(function(todo){
        if(todoId === todo.id){
            matchTodo = todo;
        }
    });

    if(matchTodo){
        res.json(matchTodo);
    }else{
        res.status(404).send();
    }
});

app.post('/todos', function(req , res){
    var body = req.body;

    body.id = todoNext++;
    todos.push(body);
    res.json(body);
})

app.listen(PORT , function(){
    console.log('listning port' + PORT + '!');
})