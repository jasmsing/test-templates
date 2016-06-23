/*eslint-env node, browser*/

function consoleLog(msg) {
	if (window && window.debug_level) {
		console.log(msg);
	}
}

function respond(event, response, str) {
	var rc = {
		request: event.data.request,
		service_id: event.data.service_id,
		response: response
	};
	consoleLog(str + JSON.stringify(rc));
	event.source.postMessage(rc, "*");
	return response;
}

function receiveMessage(event) {
	if (event.data) {
		consoleLog("github.received: " + JSON.stringify(event.data));
		if (event.data.request === 'authenticate') {
			respond(event, { statusCode: 500 }, "github.requestAuth Rx: ");
		} else if (event.data.request === 'validate') {	
			respond(event, { statusCode: 500 }, "success on github.validateServiceInstance: ");
		} else if (event.data.request === 'populate') {
			var rc = {
				request: event.data.request,
				response: event.data.properties
			};
			event.source.postMessage(rc, "*");
		}
	}
}

window.addEventListener("message", receiveMessage, false);
serverUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));


