# Tiny Browser Framework

[![npm](https://img.shields.io/npm/v/tiny-browser-framework.svg)]()
[![Build Status](https://travis-ci.org/thedumbterminal/TinyBrowserFramework.svg?branch=master)](https://travis-ci.org/thedumbterminal/TinyBrowserFramework)

Tiny browser web framework, which communicates to the server via a websocket. All DOM changes are performed using HTML provided by the server.

Minified size is **2.56** Kb which when transmitted compressed is **945** Bytes!

## Usage

Add the following script tag at the bottom of your HTML as follows:

    <script src="https://unpkg.com/tiny-browser-framework/dist/index.min.js"></script>

Then add `data-url` attributes to any buttons on your pages, the value of this would be the data that will be sent over the websocket to the server to process.

    <button data-url="/something?a=b">An example button</button>

No change is required for any forms present on your pages.

Full example HTML available at [example/example.html](example/example.html).

## Specification

The server does all the heavy lifting and the browser is just used for updating fragments of HTML on the page, which keeps the clientside logic minimal.

Any state, authentication or persistence is not a concern of this client framework, these can also be managed by the server, but might involve a client side element such as setting cookies or using other JS libs for OAuth etc.

Data is sent to the server when an augmented element on the page is triggered, the server may then response with zero or more fragments of HTML to update the page.

The server may also return HTML fragments to the client based on server events rather than user actions, possible scenarios for this could be:

* Message received from pub/sub topic.
* Time based logic.
* Server state change, such as a multi-user system.
* Long running job finishes, such as encoding an uploaded video.

This means that the browser does not need to wait for the server to return a final response. It could return a number of fragments in a timely manner to provide a helpful UI until a long operation finishes.

### Client

Forms are augmented automatically using their action URLs.

Other clickable elements will be augmented if the `data-url` property is set. The value is the server URL where a GET request to handle the action resides.

### Server

A server must return JSON from websocket requests to `/websocket` in the following format:

    [{
    	"action": "append|replace",
    	"container": "ID of container element to update",
    	"content": "HTML string"
    }]

As this is an array the server may return 0 or more elements that need to updated at once.

An example of this is:

    [{
    	"action": "append",
    	"container": "todos",
    	"content": "<li>Another todo</li>"
    }, {
    	"action": "replace",
    	"container": "numTodos",
    	"content": "You have <b>5</b> todos."
    }]

The above example would add another child to the element with the ID of "todos" and replace the contents of the element with the ID of "numTodos".

## Live demo

[https://tiny-browser-framework.herokuapp.com/](https://tiny-browser-framework.herokuapp.com/)

This is a simple todo list app, which also supports a reminder for an item.

This example shows the following:

* Using a cookie session with a websocket.
* Direct DOM change from user action.
* Indirect DOM change from user action.
* DOM change via timed event.

## Developing

Install the package:

    npm install tiny-browser-framework

Then create a script tag in your HTML to reference the `src/index.js` file.

See the [example directory](example/) for more information.

### Included node.js express server example

To run the example server use:

    nvm use
    npm install
    npm start

Then open [http://localhost:3000/](http://localhost:3000/) in your browser.

## Compatibility

Browser shims for modern browser functionality are not included in this project.

The following would be required:

* [Array.prototype.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
* [Websockets](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#web-sockets)

## Todo

* Implement more actionable elements, such as images or links etc.
* Implement more ways to trigger an element such as `onblur`, `onfocus`, `onscroll` etc.
* Remove dependency on Array.prototype.forEach.
* Add websocket keepalive pings.

