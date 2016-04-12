/* global chrome, debug */
'use strict';

const backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-page'
});

module.exports = function blocking3rdParty () {
	const urls = [];
	return new Promise(function (resolve) {
		chrome.devtools.network.onRequestFinished.addListener(function (request) {
			urls.push({
				url: request.url,
				headersSize: request.headersSize,
				bodySize: request.bodySize
			});
			debug(request.url);
		});
		backgroundPageConnection.onMessage.addListener(function (message) {
			if (message.method === 'pageLoad') {
				resolve();
			}
		});
	});
}