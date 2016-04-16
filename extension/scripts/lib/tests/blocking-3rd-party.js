/* global chrome, debug */
'use strict';

/**
 * This runs in the devtools page
 *
 * Tracks requests up until the page load event is received and then it returns.
 * Promise rejects if any third party requests are received;
 *
 * NOTE: This does not track items received via the cache API aka, from a service worker.
 */
module.exports = function blocking3rdParty () {
	return new Promise(function (resolve) {
		const urls = [];

		window.backgroundPageConnection.postMessage({
			method: 'waitForTabLoad',
			tabid: chrome.devtools.inspectedWindow.tabId
		});

		chrome.devtools.network.onRequestFinished.addListener(function (request) {
			debug('URL!' + request.url.toString());
			urls.push({
				url: request.url.toString(),
				headersSize: request.headersSize.toString(),
				bodySize: request.bodySize.toString()
			});
		});

		window.backgroundPageConnection.onMessage.addListener(function (message) {
			if (message.method === 'pageLoad') {
				debug('page loaded ' + urls.length + ' resources');
				debug(urls);
				resolve();
			}
		});
	});
}