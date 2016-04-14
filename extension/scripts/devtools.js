'use strict';
/* global chrome */

const runTests = require('./lib/tests');
const debug = a => {
	chrome.devtools.inspectedWindow.eval(
		`console.log('CPP Extension: ${typeof a === 'string' ? a : JSON.stringify(a)}');`
	, {
		useContentScriptContext: true
	});
};
const backgroundLog = a => {
	window.backgroundPageConnection.postMessage({
		method: 'customLog',
		log: `${typeof a === 'string' ? a : JSON.stringify(a)}`
	});
};

window.backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-page-' + Date.now()
});

window.debug = debug;
window.backgroundLog = backgroundLog;
window.onerror = debug;

chrome.runtime.onMessage.addListener(function (message) {
	debug(message);
	if (message.method === 'reload') {
		try {
			debug('Reloading Page');
			chrome.devtools.inspectedWindow.reload();
			runTests()
			.then(results => {
				debug(results);
				chrome.runtime.sendMessage({
					method: 'resultsReady',
					results: results
				});
			}, e => debug(e));
		} catch (e) {
			debug(e);
		}
	}
});

setImmediate(function () {
	chrome.runtime.sendMessage({
		method: 'devToolsRequestShowWidget',
		tabid: chrome.devtools.inspectedWindow.tabId
	});

	chrome.runtime.sendMessage({
		method: 'waitForReloadInteraction',
		tabid: chrome.devtools.inspectedWindow.tabId
	});
	debug('Press reload in the widget to begin.');
});