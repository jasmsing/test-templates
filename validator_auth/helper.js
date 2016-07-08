/*eslint-env browser*/
function consoleLog(msg) {
	if (window && window.debug_level) {
		console.log(msg);
	}
}

function resolveURL(relativeUrl) {
	var a = document.createElement("a");
	a.href = relativeUrl;
	return a.href;
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

// If the user didn't authorize within the last 2 seconds, then they need to auth again
function needsAuth() {
	var authTimestamp = new Date(Number(localStorage.getItem("fake.auth.time"))); // new Date(0) if never authorized
	return (Date.now() - authTimestamp) > 2000;
}

function receiveMessage(event) {
	if (event.data) {
		consoleLog("github.received: " + JSON.stringify(event.data));
		if (event.data.request === 'authenticate') {
			// In a real scenario the user's auth status would persisted in a database or something.
			// Here we check for a localStorage property set by return.html
			if (needsAuth()) {
				respond(event, {
					description: "User needs to authorize",
					statusCode: 401,
					authorizationURI: resolveURL("./return.html"),
				}, "github.requestAuth Rx: ");
			} else {
				respond(event, {
					description: "User is authorized",
				}, "github.requestAuth Rx: ");
			}
		} else if (event.data.request === 'validate') {
			// no-op - echo back what we were given
			event.source.postMessage({
				request: event.data.request,
				response: event.data.properties
			}, "*");
		} else if (event.data.request === 'populate') {
			// no-op - echo back what we were given
			event.source.postMessage({
				request: event.data.request,
				response: event.data.properties
			}, "*");
		}
	}
}

window.addEventListener("message", receiveMessage, false);
