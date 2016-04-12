'use strict'; // eslint-disable-line strict
/*global chrome, localStorage*/

let enabled;

if (localStorage.getItem('enabled') === null) {
	enabled = true;
} else {
	enabled = localStorage.getItem('enabled') === 'true';
}

function emitMessage (method, data, url){
	chrome.tabs.query({}, function (tabs){
		tabs.forEach(function (tab) {
			chrome.tabs.sendMessage(tab.id, {
				method: method,
				data: data,
				url: url
			});
		});
	});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.method === 'hasLoaded') {

		// message devtools tab loaded
	}

	if (request.method === 'isEnabled') {
		sendResponse({
			enabled: enabled
		});
	}

	if (request.method === 'setEnabled') {
		enabled = request.enabled;
		localStorage.setItem('enabled', String(request.enabled));
	}

	if (request.method === 'resultsReady') {
		emitMessage('resultsReady', request.results);
	}

	if (request.method === 'trackUiInteraction') {
		new Promise(
			resolve => chrome.identity.getProfileUserInfo(resolve)
		).then(identity => {
			chrome.tabs.query({
				active: true,
				lastFocusedWindow: true
			}, function (tabs){
				tabs.forEach(function (tab) {
					chrome.tabs.sendMessage(tab.id, {
						method: 'makeTrackingRequest',
						data: {
							identity: identity,
							details: request.details
						}
					});
				});
			});
		});
	}

	if (request.method === 'showWidget') {
		chrome.tabs.query({
			active: true,
			lastFocusedWindow: true
		}, function (tabs){
			tabs.forEach(function (tab) {
				chrome.tabs.sendMessage(tab.id, {method: 'showWidget'});
			});
		});
	}
});
