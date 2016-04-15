'use strict'; // eslint-disable-line strict
/*global chrome*/

const oTracking = require('o-tracking');

function logInteraction (e) {
	const details = {};
	const context = e.target.dataset.trackingAction;
	if (e.target.tagName === 'A') {
			details.action = 'cpp-widget-link-click';
			details.destination = e.target.href;
			if (context) details.context = context;
	} else if (context) {
			details.action = 'cpp-widget-click';
			details.context = context;
	}

	if (details.action) {
		chrome.runtime.sendMessage({
			method: 'trackUiInteraction',
			details: details
		});
	}
}

// The background script picks the active tab in the active window to make
// this request since it cannot be made from the background script
function makeTrackingRequest (details, identity) {

	const trackingReq = details;
	trackingReq.category = 'ftlabs-cpp-widget';
	trackingReq.id = identity.id;
	trackingReq.email = identity.email;

	oTracking.init({
		server: 'https://spoor-api.ft.com/px.gif',
		context: {
			product: 'ftlabs-cpp-widget'
		}
	});

	oTracking.event({
		detail: trackingReq
	});
}

function loadWidget (results) {

	// add the widget stylesheet
	require('./lib/widgetstyle');

	const header = document.createElement('div');
	const holder = document.createElement('div');
	const close = document.createElement('span');
	const textTarget = document.createElement('div');

	function removeSelf (){
		widget = null;
		holder.parentNode.removeChild(holder);
	}

	holder.appendChild(textTarget);
	holder.appendChild(header);
	header.appendChild(close);
	holder.addEventListener('click', logInteraction);

	close.classList.add('close');
	close.dataset.trackingAction = 'close';
	close.addEventListener('click', removeSelf, false);

	holder.setAttribute('id', 'cpp-widget-holder');
	document.body.appendChild(holder);

	if (results) {
		textTarget.innerHTML = results;
	} else {
		const refresh = document.createElement('button');
		refresh.textContent = 'Begin tests (Reloads page)';
		refresh.addEventListener('click', function refresh () {
			chrome.runtime.sendMessage({
				method: 'reloadMe'
			});
		});
		textTarget.appendChild(refresh);
	}

	return {
		close: removeSelf,
	}
}

let widget;
let text;
chrome.runtime.onMessage.addListener(function (request) {

	if (request.method === 'showWidget' && !widget) {
		widget = loadWidget(text);
	}

	if (request.method === 'makeTrackingRequest') {
		makeTrackingRequest(request.data.details, request.data.identity);
	}

	if (request.method === 'resultsReady') {

		const results = request.data;

		chrome.runtime.sendMessage({
			method: 'isEnabled',
			host: location.host
		}, response => {
			if (widget) widget.close();
			if (response.enabled) widget = loadWidget(results);
		});
	}
});

window.addEventListener('load', function loaded () {
	chrome.runtime.sendMessage({
		method: 'hasLoaded'
	});
});