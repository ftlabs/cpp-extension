'use strict';
/* global chrome */

const runTests = require('./lib/tests');
const debug = a => {
	let stack;
	if (a.constructor === Error) {
		stack = a.stack.toString();
	} else {
		stack = Error('Stack').stack.toString().split('\n').map(s => s.trim()).slice(3,6).join('\n');
	}
	chrome.devtools.inspectedWindow.eval(
		'console.log(`%c CPP Extension: ' + (typeof a === 'string' ? a : JSON.stringify(a)) + '`, "font-weight:bold;"); console.log(`%c ' + stack + '`, "color:grey;");'
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

window.backgroundPageConnection.onMessage.addListener(function (message) {
	debug('Message from background tab to devtools: ' + JSON.stringify(message));

	if (message.method === 'pageLoad') {

		// Trigger the client page to start it's testing
		window.backgroundPageConnection.postMessage({
			method: 'startTests',
			tabid: chrome.devtools.inspectedWindow.tabId
		});
	}

	// Page was reloaded start the devtools tests
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

window.debug = debug;
window.backgroundLog = backgroundLog;
window.onerror = function (e) {
	debug({
		message: e.message,
		stack: e.stack
	});
}

setImmediate(function () {

	if (!chrome.devtools.inspectedWindow.tabId) return;

	window.backgroundPageConnection.postMessage({
		method: 'devToolsRequestShowWidget',
		tabid: chrome.devtools.inspectedWindow.tabId
	});

	window.backgroundPageConnection.postMessage({
		method: 'waitForReloadInteraction',
		tabid: chrome.devtools.inspectedWindow.tabId
	});
	debug('Press reload in the widget to begin.');
});