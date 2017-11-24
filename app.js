var express = require('express');
var app = express();

var todos = [
    {
        id: 1,
        description: "Hi One",
        completed: false
    },
    {
        id: 2,
        description: "Hi Two",
        completed: false
    },
    {
        id: 3,
        description: "Hi Three",
        completed: false
    },
];

var PORT = process.env.PORT || 3000;

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
})

app.listen(PORT , function(){
    console.log('listning port' + PORT + '!');
})