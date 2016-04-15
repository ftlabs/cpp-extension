/* global chrome, debug */
'use strict';

module.exports = function blocking3rdParty () {
	const urls = [];
	return new Promise(function (resolve) {

		window.backgroundPageConnection.postMessage({
			method: 'waitForTabLoad',
			tabid: chrome.devtools.inspectedWindow.tabId
		});

		chrome.devtools.network.onRequestFinished.addListener(function (request) {
			urls.push({
				url: request.url,
				headersSize: request.headersSize,
				bodySize: request.bodySize
			});
			debug('Received request: ' + JSON.stringify(request, null, '  '));
		});
		window.backgroundPageConnection.onMessage.addListener(function (message) {
			if (message.method === 'pageLoad') {
				debug('page loaded ' + urls.length + ' resources');
				resolve();
			}
		});
	});
}