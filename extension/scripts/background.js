'use strict'; // eslint-disable-line strict
/*global chrome, localStorage*/

let enabled;
const loadCallbacks = new Map();
const refreshTabCallbacks = new Map();

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

function devToolsListener (message) {

	if (message.method === 'customLog') {
		console.log(message.log);
	}
	return true;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (sender.tab) {

		// If it is from a tab
		const tabId = sender.tab.id;

		if (request.method === 'hasLoaded') {
			if (loadCallbacks.has(tabId)) {
				loadCallbacks.get(tabId)({
					method: 'pageLoad'
				});
				loadCallbacks.delete(tabId);
			}
			return;
		}

		if (request.method === 'reloadMe') {
			if (refreshTabCallbacks.has(tabId)) {
				refreshTabCallbacks.get(tabId)({
					method: 'reload'
				});
				refreshTabCallbacks.delete(tabId);
			}
			return;
		}

		if (request.method === 'isEnabled') {
			sendResponse({
				enabled: enabled
			});
			return;
		}

		if (request.method === 'setEnabled') {
			enabled = request.enabled;
			localStorage.setItem('enabled', String(request.enabled));
			return;
		}

		if (request.method === 'resultsReady') {
			emitMessage('resultsReady', request.results);
			return;
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
			return true;
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
			return true;
		}
	} else {

		sendResponse('Hello World');

		// It is from devtools
		if (request.method === 'waitForTabLoad') {
			loadCallbacks.set(request.tabid, sendResponse);
		}

		if (request.method === 'waitForReloadInteraction') {
			refreshTabCallbacks.set(request.tabid, sendResponse);
			sendResponse({method: 'reload'});
		}

		if (request.method === 'devToolsRequestShowWidget') {
			chrome.tabs.sendMessage(request.tabid, {method: 'showWidget'});
		}
	}

	return true;
});


chrome.runtime.onConnect.addListener(function (devToolsConnection) {
    devToolsConnection.onMessage.addListener(devToolsListener);

    devToolsConnection.onDisconnect.addListener(function () {
		devToolsConnection.onMessage.removeListener(devToolsListener);
    });
});