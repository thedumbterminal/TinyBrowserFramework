'use strict';

var TBF = function(){
	this._setupListeners();
};

TBF.prototype._augmentInterface = function(){
	var tags = document.getElementsByTagName('BUTTON');
	for(var i = 0; i < tags.length; i++){
		this._augmentButton(tags.item(i));
	}
	tags = document.getElementsByTagName('FORM');
	for(var i = 0; i < tags.length; i++){
		this._augmentForm(tags.item(i))
	}

};

TBF.prototype._augmentButton = function(ele){
	if(!ele.dataset.url){
		return;
	}
	if(ele.onclick){	// already done
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
	var self = this;
	fetch(this._getActionURL(ele))
		.then(function(response){
			return response.json();
		})
		.then(function(json){
			self._handleResponse(json);
		})
		.catch(function(error) {
			throw error
		});
};

TBF.prototype._getActionURL = function(ele){
	if(ele.tagName === 'BUTTON'){
		return ele.dataset.url;
	}
	else if(ele.tagName === "FORM"){
		return ele.action;
	}
	throw new Error('Unknown element type');
};

TBF.prototype._handleResponse = function(json){
	console.log('got json:', json);
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
	document.addEventListener('DOMContentLoaded', function(event) {
		self._augmentInterface();
	});
	document.addEventListener('DOMSubtreeModified', function(event) {
		self._augmentInterface();
	});
};

window.tbfInstance = new TBF();
