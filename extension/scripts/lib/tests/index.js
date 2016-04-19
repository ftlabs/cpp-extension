'use strict';
/* globals debug, chrome */

const tests = {
	thirdParty: require('./blocking-3rd-party')
};

function reportTestToWidget (name, result) {
	const resultObj = {};
	resultObj[name] = result;
	window.loadPromise.then(function () {
		window.backgroundPageConnection.postMessage({
			method: 'resultsReady',
			tabid: chrome.devtools.inspectedWindow.tabId,
			data: resultObj
		});
	});
}

module.exports = function runTests () {
	return Promise.all(
		Object.keys(tests).map(
			testName => tests[testName]()
			.then(() => true)
			.catch(e => {
				debug(e);
				return false;
			})
			.then(result => reportTestToWidget(testName, result))
		)
	);
};