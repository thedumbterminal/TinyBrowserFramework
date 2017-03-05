# Tiny Browser Framework

[![npm](https://img.shields.io/npm/v/tiny-browser-framework.svg)]()
[![Build Status](https://travis-ci.org/thedumbterminal/TinyBrowserFramework.svg?branch=master)](https://travis-ci.org/thedumbterminal/TinyBrowserFramework)

Tiny browser web framework, which communicates to the server via a websocket. All DOM changes are performed using HTML provided by the server.

Minified size is 2.25 Kb which when transmitted compressed is 858 Bytes!

## Usage

Install the package:

    npm install tiny-browser-framework

Then create a script tag in your HTML to reference the `src/index.js` file.

See the example for more information.

## Specification

### Client

Forms are augmented automatically using their action URLs.

Other clickable elements will be augmented if the `data-url` property is set. The value is the server URL where a GET request to handle the action resides.

### Server

A server must return JSON from websocket requests in the following format:

    [{
    	"action": "append|replace",
    	"container": "ID of container element to update",
    	"content": "HTML string"
    }]

As this is an array the server may return 0 or more elements that need to updated.

## Example

To run the example server use:

    nvm use
    npm install
    npm start

Then open [http://localhost:3000/](http://localhost:3000/) in your browser.

This is a simple todo list app, which also supports a reminder for an item.

This example shows the following:

* Using a cookie session with a websocket.
* Direct DOM change from user action.
* Indirect DOM change from user action.
* DOM change via timed event.

## Compatibility

Browser shims for modern browser functionality are not included in this project.

The following would be required:

* Array.prototype.forEach
* Websockets

## Todo

* Implement more actionable elements, such as images or links etc.

