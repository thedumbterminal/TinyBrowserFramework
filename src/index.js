'use strict';

var TBF = function(){
	this._setupListeners();
	this._setupWebsocket();
};

TBF.prototype._setupWebsocket = function(){
	var socketUrl = window.location.protocol.replace('http', 'ws') + '//' + window.location.host + '/websocket';
	this._websocket = new WebSocket(socketUrl);
	var self = this;
	this._websocket.onopen = function(){
		self._augmentInterface();
	};
	this._websocket.onclose = function(){
		setTimeout(function(){
			self._websocket.readyState > 1 && self._setupWebsocket();
		}, 1000);
	};
	this._websocket.onmessage = function(event){
		var jsons = JSON.parse(event.data);
		jsons.forEach(function(json){
			self._handleResponse(json);
		});
	};
};

TBF.prototype._augmentInterface = function(){
	var tags = document.getElementsByTagName('BUTTON');
	for(var i = 0; i < tags.length; i++){
		this._augmentButton(tags.item(i));
	}
	tags = document.getElementsByTagName('FORM');
	for(var i = 0; i < tags.length; i++){
		this._augmentForm(tags.item(i));
	}
	if(this._websocket.readyState === 1){	// only do this if we have a working web socket
		tags = document.getElementsByTagName('DIV');
		for(var i = 0; i < tags.length; i++){
			this._augmentDiv(tags.item(i));
		}
	}
};

TBF.prototype._augmentDiv = function(ele){
	if(!ele.dataset.url || ele.dataset.actioned){	// not supported or already done
		return;
	}
	console.log('augmenting div: ', ele);
	ele.dataset.actioned = 1;
	this._elementActivated(ele);	// activate immediately
};

TBF.prototype._augmentButton = function(ele){
	if(!ele.dataset.url || ele.onclick){	// not supported or already done
		return;
	}
	console.log('augmenting button: ', ele);
	var self = this;
	ele.onclick = function(){
		self._elementActivated(ele);
	}
};

TBF.prototype._augmentForm = function(ele){
	if(ele.onsubmit){	// already done
		return;
	}
	console.log('augmenting form: ', ele);
	var self = this;
	ele.onsubmit = function(){
		self._elementActivated(ele);
		return false;
	}
};

TBF.prototype._elementActivated = function(ele){
	console.log('element activated:', ele);
	this._websocket.send(this._getActionURL(ele));
};

TBF.prototype._getActionURL = function(ele){
	if(['BUTTON', 'DIV'].indexOf(ele.tagName) !== -1){
		return ele.dataset.url;
	}
	if(ele.tagName === 'FORM'){
		var kvPairs = [];
		for(var i = 0; i < ele.elements.length; i++){
			var e = ele.elements[i];
			kvPairs.push(encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value));
		}
		var queryString = kvPairs.join('&');
		return ele.action + '?' + queryString;
	}
	throw new Error('Unknown element type');
};

TBF.prototype._handleResponse = function(json){
	var container = document.getElementById(json.container);
	if(!container){
		throw new Error('container not found: ' + json.container);
	}
	if(json.action === 'replace'){
		container.innerHTML = json.content;
	}
	else if(json.action === 'append'){
		var template = document.createElement('template');
		template.innerHTML = json.content;
		for(var i = 0; i < template.content.childNodes.length; i++){
			container.appendChild(template.content.childNodes.item(i));
		}
	}
	else{
		throw new Error('Unknown action: ', json.action);
	}
};

TBF.prototype._setupListeners = function(){
	var self = this;
	document.addEventListener('DOMContentLoaded', function() {
		self._augmentInterface();
	});
	document.addEventListener('DOMSubtreeModified', function() {
		self._augmentInterface();
	});
	window.onbeforeunload = function(){
		self._websocket && self._websocket.close();
	};
};

window.tbfInstance = new TBF();
