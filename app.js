var express = require('express');
var app = express();
var _ = require('underscore');
var bodyParser = require('body-parser');
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
    var matchTodo = _.findWhere(todos, {id: todoId});

    // var matchTodo;
    // todos.forEach(function(todo){
    //     if(todoId === todo.id){
    //         matchTodo = todo;
    //     }
    // });

    if(matchTodo){
        res.json(matchTodo);
    }else{
        res.status(404).send();
    }
});

app.post('/todos', function(req , res){
    var body = _.pick(req.body , 'description' , 'completed');

    if(! _.isBoolean(body.completed) || ! _.toString(body.description) || body.description.trim().length === 0){
        return res.status(400).send();
    }

    body.description = body.description.trim();
    body.id = todoNext++;
    todos.push(body);
    res.json(body);
})

app.listen(PORT , function(){
    console.log('listning port' + PORT + '!');
})