const session = require('express-session')
const express = require('express')

var app = express()

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'really secure'
}))
app.use(express.static('example/public'))
app.use(express.static('src'))

app.get('/delete', function (req, res, next) {
	const filtered = req.session.todos.filter(function(item){
		return item.id !== parseInt(req.query.id, 10)
	})
	req.session.todos = filtered
	const response = {
		action: 'replace',
		container: 'lists',
		content: renderTodos(req.session)
	}
	res.send(JSON.stringify(response))
})

app.get('/add', function (req, res, next) {
	const sess = req.session
	if(!sess.todos){
		sess.todos = []
	}
	const todo = {
		id: sess.todos.length + 1,
		description: req.query.description
	}
	sess.todos.push(todo)
	const response = {
		action: 'append',
		container: 'lists',
		content: '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="delete?id=' + todo.id + '">Delete</button></li>'
	}
	res.send(JSON.stringify(response))
})

app.listen(3000)

const renderTodos = function(sess){
	if(!sess.todos){
		return ''
	}
	return sess.todos.reduce(function(acc, todo){
		acc += '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="delete?id=' + todo.id + '">Delete</button></li>'
		return acc
	}, '')
}
