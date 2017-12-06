var express = require('express');
var app = express();
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

var bodyParser = require('body-parser');
var todos = [];
var todoNext = 1;

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json())

app.get('/' , function(req , res){
    res.send('Hi There');
});

// Array of Todo
app.get('/todos', middleware.requireAuthentication, function(req , res){
    var querParams = req.query;
    var where = {
        userId: req.user.get('id')
    };

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
});


// todo by it's id
app.get('/todo/:id', middleware.requireAuthentication, function(req , res){
    var todoId = parseInt(req.params.id, 10);
    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(todo){
        if(!!todo){
            res.json(todo.toJSON());
        }else{
            res.status(404).send();
        }
    },function(e){
        res.status(500).send()
    });
});

// Create Todo
app.post('/todos', middleware.requireAuthentication, function(req , res){
    var body = _.pick(req.body , 'description' , 'completed');

    db.todo.create(body).then(function (todo){
        req.user.addTodo(todo).then(function(){
            return todo.reload();
        }).then(function(todo){
            res.json(todo.toJSON());
        });
    }, function(e){
        res.status(400).json(e);
    });
});


// delete Todo
app.delete('/todos/:id', middleware.requireAuthentication , function(req , res){
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (rowsDeleted){
        if(rowsDeleted === 0){
            res.status(404).json({
                error: 'No Todo With Id'
            });
        }else{
            res.status(204).send();
        }
    },function(){
        res.status(500).send();
    });
});


// Update Todo
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
        id: todoId,
        userId: req.user.get('id')
    }).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

// user
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toSignJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});



//login
app.post('/users/login', function(req , res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');
        userInstance = user;
        user.token= token;

        return db.token.create({
            token: token
        });
	}).then(function (tokenInstance){
        res.header('token', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function () {
		res.status(401).send();
	});
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});
});


db.sequelize.sync(
    // {force: true}
).then(function(){
    app.listen(PORT , function(){
        console.log('listning port' + PORT + '!');
    });
});

