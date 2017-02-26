'use strict';

var TBF = function(){
	this._setupListeners();
};

TBF.prototype._augmentInterface = function(){
	var tags = document.getElementsByTagName('BUTTON');
	//console.log(tags);
	for(var i = 0; i < tags.length; i++){
		this._augmentElement(tags.item(i))
	}
};

TBF.prototype._augmentElement = function(ele){
	if(!ele.dataset.url){
		return;
	}
	if(ele.onclick){
		return
	}
	console.log('augmenting element: ', ele);
	var self = this;
	ele.onclick = function(){
		self._elementActivated(ele);
	}
};

TBF.prototype._objToParams = function(obj){
	var keys = Object.keys(obj);
	var wanted = keys.filter(function(item){
		return item !== 'url';
	});
	var pairs = wanted.map(function(item){
		return item + '=' + window.encodeURIComponent(obj[item]); 
	});
	return pairs.join('&');
};

TBF.prototype._elementActivated = function(ele){
	console.log('element activated:', ele.id);
	var params = this._objToParams(ele.dataset);
	var self = this;
	fetch(ele.dataset.url + '?' + params)
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
		//console.log('DOM fully loaded and parsed');
		self._augmentInterface();
	});
	document.addEventListener('DOMSubtreeModified', function(event) {
		//console.log('DOM sub tree loaded');
		self._augmentInterface();
	});
};

window.tbfInstance = new TBF();
