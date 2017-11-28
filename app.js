var express = require('express');
var app = express();
var _ = require('underscore');
var db = require('./db.js');

var bodyParser = require('body-parser');
var todos = [];
var todoNext = 1;

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json())

app.get('/' , function(req , res){
    res.send('Hi There');
});

// Array of Todo
app.get('/todos', function(req , res){
    var querParams = req.query;
    var where = {};

    if(querParams.hasOwnProperty('completed') && querParams.completed === "true"){
            where.completed = true;
        }
        else if (querParams.hasOwnProperty('completed') && querParams.completed === "false") {
            where.completed = false;
        }

        if(querParams.hasOwnProperty('q') && querParams.q.length > 0){
                where.description = {
                    $like: '%'+ querParams.q +'%'
                };
            }

            db.todo.findAll({where: where}).then(function (todos) {
                res.json(todos);
            }, function(e){
                res.status(500).send();
            });


    // var filterTodo = todos;
    // if(querParams.hasOwnProperty('completed') && querParams.completed === "true"){
    //     filterTodo = _.where(filterTodo ,{completed: true} );
    // }
    // else if(querParams.hasOwnProperty('completed') && querParams.completed === "false"){
    //     filterTodo = _.where(filterTodo ,{completed: false} );
    // }

    // if(querParams.hasOwnProperty('q') && querParams.q.length > 0){
    //     filterTodo = _.filter(filterTodo , function(todo){
    //         return todo.description.toLowerCase().indexOf(querParams.q.toLowerCase()) > -1;
    //     });
    // }

    // res.json(filterTodo);

});


// todo by it's id
app.get('/todo/:id', function(req , res){
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        }else{
            res.status(404).send();
        }
    },function(e){
        res.status(500).send()
    });
    // var matchTodo = _.findWhere(todos, {id: todoId});

    // // var matchTodo;
    // // todos.forEach(function(todo){
    // //     if(todoId === todo.id){
    // //         matchTodo = todo;
    // //     }
    // // });

    // if(matchTodo){
    //     res.json(matchTodo);
    // }else{
    //     res.status(404).send();
    // }
});

// Create Todo
app.post('/todos', function(req , res){
    var body = _.pick(req.body , 'description' , 'completed');

    db.todo.create(body).then(function (todo){
        res.json(todo.toJSON());
    }, function(e){
        res.status(400).json(e);
    });
    // if(! _.isBoolean(body.completed) || ! _.toString(body.description) || body.description.trim().length === 0){
    //     return res.status(400).send();
    // }

    // body.description = body.description.trim();
    // body.id = todoNext++;
    // todos.push(body);
    // res.json(body);
});


// delete Todo
app.delete('/todos/:id' , function(req , res){
    var todoId = parseInt(req.params.id, 10);
    var matchTodo = _.findWhere(todos, {id: todoId});

    if(matchTodo){
        todos = _.without(todos , matchTodo);
        res.json(matchTodo);
    }else{
        res.status(404).json({"error" : "No Todo for this id"});
    }
});


// Update Todo
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

db.sequelize.sync().then(function(){
    app.listen(PORT , function(){
        console.log('listning port' + PORT + '!');
    });
});

