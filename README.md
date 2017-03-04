# Tiny Browser Framework

## Specification

### Client

Forms are augmented automatically using their action URLs.

Other clickable elements will be augmented if the `data-url` property is set. The value is the server URL where a GET request to handle the action resides.

### Server

A server must return JSON from GET requests in the following format:

    [{
    	"action": "append|replace",
    	"container": "ID of container element to update",
    	"content": "HTML string"
    ]}

## Compatibility

Browser shims for modern browser functionality are not included in this project.

* Array.prototype.forEach
* Websockets

## Todo

* Implement more actionable elements, such as images, tick boxes or links etc.
* Use websocket for all changes.
* Add example for a related DOM change.
