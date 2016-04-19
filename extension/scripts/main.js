'use strict'; // eslint-disable-line strict
/*global chrome*/

const oTracking = require('o-tracking');

const STRINGS = {
	thirdParty: [
		'The page uses no 3rd party assets',
		'The page uses some 3rd party assets, this may cause the page to load slowly due to the time it takes to handshake to the third party server.'
	],
	scrollListeners: [
		'The page does not listen for scroll events',
		'The page runs javascript triggered on scroll events, this can poor animation performance when the user scrolls due.'
	]
}

const tests = {
	scrollListeners : require('./lib/tests/scroll.js')
}

const results = {};
Object.keys(STRINGS).forEach(key => results[key] = true);

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

function loadWidget (promptRefresh) {

	// add the widget stylesheet
	require('./lib/widgetstyle');
	console.log('Showing Widget');

	const header = document.createElement('div');
	const holder = document.createElement('div');
	const close = document.createElement('span');
	const textTarget = document.createElement('div');

	function removeSelf () {
		widget = null;
		holder.parentNode.removeChild(holder);
	}

	function update () {
		if (!promptRefresh) {
			let string = '<ul>';
			Object.keys(STRINGS).forEach(key => {
				string = string + `<li>${STRINGS[key][results[key] === false ? 1 : 0]}</li>`;
			});
			textTarget.innerHTML = string + '</ul>';
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

	update();

	widget = {
		close: removeSelf,
		update
	}
}

function beginTests () {
	console.log('Starting tests');
	
	return Promise.all(
		Object.keys(tests).map(
			testName => tests[testName]()
			.then(() => true)
			.catch(e => {
				debug(e);
				return false;
			})
			.then(result => {
				return [testName, result];
			})
		)
	);
	
}

let widget;
chrome.runtime.onMessage.addListener(function (request) {

	if (request.method === 'showWidget') {
		if (request.promptRefresh && widget) widget.close();
		if (!widget) loadWidget(request.promptRefresh);
	}

	if (request.method === 'makeTrackingRequest') {
		makeTrackingRequest(request.data.details, request.data.identity);
	}

	if (request.method === 'startTests') {
		if (!widget) loadWidget();
		beginTests()
			.then(testResults => {
				testResults.forEach(result => {
					results[result[0]] = result[1]; 
				});
				widget.update();				
			})
		;
	}

	if (request.method === 'resultsReady') {
		if (!widget) {
			chrome.runtime.sendMessage({
				method: 'isEnabled',
				host: location.host
			}, response => {
				if (response.enabled) {
					loadWidget();
				}
			});
		} else {

			Object.keys(request.data).forEach(key => {
				results[key] = request.data[key];
			});
			widget.update();
		}
	}
});


// Always fire load event to background in case
// the devtools are open and it is waiting
window.addEventListener('load', function loaded () {
	chrome.runtime.sendMessage({
		method: 'hasLoaded'
	});
});