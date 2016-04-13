/* global chrome, debug */
'use strict';

module.exports = function blocking3rdParty () {
	const urls = [];
	return new Promise(function (resolve) {
		chrome.devtools.network.onRequestFinished.addListener(function (request) {
			urls.push({
				url: request.url,
				headersSize: request.headersSize,
				bodySize: request.bodySize
			});
			debug(JSON.stringify(request, null, '  '));
		});
		window.backgroundPageConnection.onMessage.addListener(function (message) {
			if (message.method === 'pageLoad') {
				resolve();
			}
		});
	});
}