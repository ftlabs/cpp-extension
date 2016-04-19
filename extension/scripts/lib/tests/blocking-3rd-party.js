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
	return new Promise(function (resolve, reject) {
		const urls = [];

		window.backgroundPageConnection.postMessage({
			method: 'waitForTabLoad',
			tabid: chrome.devtools.inspectedWindow.tabId
		});

		chrome.devtools.network.onRequestFinished.addListener(function (e) {
			urls.push({
				url: e.request.url,
				headersSize: e.response.headersSize,
				bodySize: e.response.bodySize
			});
		});

		window.backgroundPageConnection.onMessage.addListener(function (message) {
			if (message.method === 'pageLoad') {
				debug('page loaded ' + urls.length + ' resources', true);
				try {
					for (const r of urls) {
						if (r.url.match(/^http/) && (new URL(r.url)).host !== (new URL(window.connectedPageUrl)).host) {
							return reject(`3rd party url ${r.url} is not from ${(new URL(window.connectedPageUrl)).host}`, true);
						}
					}
				} catch (e) {
					debug(e);
				}
				resolve();
			}
		});
	});
}