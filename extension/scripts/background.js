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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (sender.tab) {

		// If it is from a tab
		const tabId = sender.tab.id;

		if (request.method === 'hasLoaded') {
			if (loadCallbacks.has(tabId)) {
				loadCallbacks.get(tabId).postMessage({
					method: 'pageLoad'
				});
				sendResponse({method: 'showWidget'});
				loadCallbacks.delete(tabId);
			}
			return;
		}

		if (request.method === 'reloadMe') {
			if (refreshTabCallbacks.has(tabId)) {
				refreshTabCallbacks.get(tabId).postMessage({
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
	}

	return true;
});

function devToolsListener (message, sender) {

	if (message.method === 'customLog') {
		console.log(message.log);
	}

	if (message.method === 'echo') {
		sender.postMessage(message);
	}

	if (message.method === 'startTests') {
		chrome.tabs.sendMessage(message.tabid, {
			method: 'startTests'
		});
	}

	// It is from devtools
	if (message.method === 'waitForTabLoad') {
		loadCallbacks.set(message.tabid, sender);
	}

	if (message.method === 'waitForReloadInteraction') {
		refreshTabCallbacks.set(message.tabid, sender);
	}

	if (message.method === 'devToolsRequestShowWidget') {
		chrome.tabs.sendMessage(message.tabid, {
			method: 'showWidget',
			promptRefresh: true
		});
	}
	return true;
}


chrome.runtime.onConnect.addListener(function (devToolsConnection) {
    devToolsConnection.onMessage.addListener(devToolsListener);
	devToolsConnection.postMessage({
		method: 'connectionConfirmation'
	});

    devToolsConnection.onDisconnect.addListener(function () {
		devToolsConnection.onMessage.removeListener(devToolsListener);
    });
});