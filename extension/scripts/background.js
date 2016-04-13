'use strict'; // eslint-disable-line strict
/*global chrome, localStorage*/

let enabled;
const devtools = new Set();

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

function emitMessageToDevtools (method, data) {

	// devtools connection can't send :( need to find a way!
	devtools.forEach(function (devtoolConnection) {
		devtoolConnection.sendMessage({
			method: method,
			data: data
		});
	})
}

function devToolsListener (message) { //sender, sendResponse
	if (message.method === 'customLog') {
		console.log(message.log);
	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.method === 'hasLoaded') {
		emitMessageToDevtools('hasLoaded', {});
	}

	if (request.method === 'reloadMe') {
		const tabid = sender.tab.id;
		emitMessageToDevtools('reload', {
			tab: tabid
		});
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


chrome.runtime.onConnect.addListener(function (devToolsConnection) {
    devToolsConnection.onMessage.addListener(devToolsListener);
	devtools.add(devToolsConnection);

    devToolsConnection.onDisconnect.addListener(function () {
		devToolsConnection.onMessage.removeListener(devToolsListener);
		devtools.delete(devToolsConnection);
    });
});