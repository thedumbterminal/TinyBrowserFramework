'use strict'

const session = require('express-session')
const express = require('express')
const url = require('url')
const qs = require('qs')
const http = require('http')
const WebSocket = require('ws')

const app = express()

const sessionHandler = session({
	resave: true,
	saveUninitialized: true,
	secret: 'really secure'
})

app.use(sessionHandler)

const server = http.createServer(app);

const wss = new WebSocket.Server({
	server: server,
	path: '/websocket'
})

app.use(express.static('src'))

app.get('/', function(req, res, next){
	const response = `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8"/>
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Tiny Browser Framework: Todo Example</title>
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
		</head>
		<body>
			<div class="container">
				<h1>Todo Example</h1>
				<ul id="lists" class="list-group">
					${renderTodos(req.session)}
				</ul>
				<form action="add">
					<input type="text" name="description" />
					<input type="submit" value="Add"/>
				</form>
			</div>
			<script src="index.js"></script>
		</body>
	</html>
	`
	res.send(response)
})

wss.on('connection', function(ws){
	let req = {
		originalUrl: '/',
		pathname: '/',
		headers: ws.upgradeReq.headers
	}
	sessionHandler(req, {}, function(){
		ws.on('message', function(msg){
			console.log(msg)
			const parsed = url.parse(msg)
			processMessage(ws, parsed, req.session)
		})

	})
})

server.listen(3000, function listening(){
  console.log('Listening on %d', server.address().port);
});


const processMessage = function(ws, request, session){
	const query = qs.parse(request.query)
	if(request.pathname === '/add'){
		addRoute(query, session, function(out){
			ws.send(JSON.stringify(out))
		})
	}
	else if(request.pathname === '/delete'){
		deleteRoute(query, session, function(out){
			ws.send(JSON.stringify(out))
		})
	}
};

const deleteRoute = function (query, session, cb){
	const filtered = session.todos.filter(function(item){
		return item.id !== parseInt(query.id, 10)
	})
	session.todos = filtered
	session.save(function(){
		const response = [{
			action: 'replace',
			container: 'lists',
			content: renderTodos(session)
		}]
		cb(response)
	})
};

const addRoute = function(query, session, cb){
	if(!session.todos){
		session.todos = []
	}
	const todo = {
		id: (new Date).getTime(),
		description: query.description
	}
	session.todos.push(todo)
	session.save(function(){
		const response = [{
			action: 'append',
			container: 'lists',
			content: '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="/delete?id=' + todo.id + '">Delete</button></li>'
		}]
		cb(response)
	})
};

const renderTodos = function(sess){
	if(!sess.todos){
		return ''
	}
	return sess.todos.reduce(function(acc, todo){
		acc += '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="/delete?id=' + todo.id + '">Delete</button></li>'
		return acc
	}, '')
}
