# Tiny Browser Framework

## Specification

### Client

All clickable elements will be augmented if the `data-url` property is set. The value is the server URL where the request to handle the action resides.

Extra GET parameters can be specified with further data properties.

### Server

A server must return JSON from GET requests in the following format:

    {
    	"action": "append|replace",
    	"container": "ID of container element to update",
    	"content": "HTML string"
    }

## Compatibility

Browser shims for modern browser functionality are not included in this project.
