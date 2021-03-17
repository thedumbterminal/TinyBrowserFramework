'use strict'
//Server for demo application

const session = require('express-session')
const express = require('express')
const url = require('url')
const qs = require('qs')
const http = require('http')
const WebSocket = require('ws')
const compression = require('compression')
const info = require('../package.json')

const app = express()

const sessionHandler = session({
	resave: true,
	saveUninitialized: true,
	secret: 'really secure'
})

app.use(compression())
app.use(sessionHandler)
app.use(express.static('src'))

const server = http.createServer(app)

const wss = new WebSocket.Server({
	server: server,
	path: '/websocket'
})

const port = process.env.PORT || 3000
server.listen(port, () => {
	console.log('Listening on %d', server.address().port)
});

//Return the starting HTML to the client
//Just inlined it here as this is just an example server.
app.get('/', (req, res, next) => {
	const scriptSrc = process.env.NODE_ENV === 'production' ? `https://unpkg.com/tiny-browser-framework@${info.version}/dist/index.min.js` : 'index.js'
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
				<div class="page-header">
					<h1>Todo Example</h1>
				</div>
				<div id="intro" data-url="/intro"></div>
				<div id="count">${renderTodoCount(req.session)}</div>
				<ul id="lists" class="list-group">
					${renderTodos(req.session)}
				</ul>
				<form action="add">
					<div class="form-group">
						<label>Description</label><input type="text" name="description" />
					</div>
					<div class="form-group">
						<label>Reminder (seconds)</label><input type="range" name="reminder" max="20" value="0"/>
					</div>
					<input type="submit" value="Add"/>
				</form>
				<div id="reminder" style="margin-top: 10px"></div>
			</div>
			<script src="${scriptSrc}"></script>
		</body>
	</html>
	`
	res.send(response)
})

wss.on('connection', (ws, upgradeReq) => {
	const req = {	//Fake a request that we would normally see over HTTP
		originalUrl: '/',
		pathname: '/',
		headers: upgradeReq.headers
	}
	sessionHandler(req, {}, () => {	//Process session once a client connects
		ws.on('message', (msg) => {
			console.log(msg)
			const parsed = url.parse(msg)
			routeMessage(ws, parsed, req.session)
		})
	})
})

//Simple router
const routeMessage = (ws, request, session) => {
	const query = qs.parse(request.query)
	//The example app only has these functions
	const outputCallback = (out) => {
		ws.send(JSON.stringify(out))
	}

	if(request.pathname === '/add'){
		addRoute(query, session, outputCallback)
	}
	else if(request.pathname === '/delete'){
		deleteRoute(query, session, outputCallback)
	}
	else if(request.pathname === '/intro'){
		introRoute(query, session, outputCallback)
	}
}

//Display intro message
const introRoute = (query, session, cb) => {
	setTimeout(() => {	// Add a delay to highlight the content being loaded without user interaction
		cb([{
			action: 'replace',
			container: 'intro',
			content: '<h3>Just use the form below to add a todo<h3>'
		}])
	}, 2000)
}

//Deleting a todo
const deleteRoute = (query, session, cb) => {
	const filtered = session.todos.filter((item) => {
		return item.id !== parseInt(query.id, 10)
	})
	session.todos = filtered
	session.save(() => {
		const response = [{
			action: 'replace',
			container: 'lists',
			content: renderTodos(session)
		},{
			action: 'replace',
			container: 'count',
			content: renderTodoCount(session)
		}]
		cb(response)
	})
}

//Adding a todo
const addRoute = (query, session, cb) => {
	if(!session.todos){
		session.todos = []
	}
	const todo = {
		id: (new Date).getTime(),
		description: query.description,
		reminder: query.reminder
	}
	session.todos.push(todo)
	session.save(() => {
		const response = [{
			action: 'append',
			container: 'lists',
			content: '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="/delete?id=' + todo.id + '">Delete</button></li>'
		},{
			action: 'replace',
			container: 'count',
			content: renderTodoCount(session)
		}]
		if(todo.reminder !== '0'){
			console.log('scheduling reminder')
			sendReminder(todo, cb)
		}
		cb(response)
	})
}

//Send a message back to the client at some point in the future.
//cb() is the send function on the websocket so we can call it as many times as we need.
const sendReminder = (todo, cb) => {
	setTimeout(() => {
		const reminderResponse = [{
			action: 'replace',
			container: 'reminder',
			content: '<div class="alert alert-info" role="alert" onclick="this.style.display = \'none\';">Reminder for ' + todo.description + '!</div>'
		}]
		cb(reminderResponse)
	}, todo.reminder * 1000)
}

//Generate the HTML for all the todos
const renderTodos = (sess) => {
	if(!sess.todos){
		return ''
	}
	return sess.todos.reduce((acc, todo) => {
		acc += '<li class="list-group-item">' + todo.description + ' <button class="pull-right" data-url="/delete?id=' + todo.id + '">Delete</button></li>'
		return acc
	}, '')
}

//Generate the HTML for the number of todos
const renderTodoCount = (sess) => {
	const number = sess.todos ? sess.todos.length : 0
	return `You have <strong>${number}</strong> todos right now.`
}
