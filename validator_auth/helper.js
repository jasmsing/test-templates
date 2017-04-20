/*eslint-env browser*/
/*eslint-disable no-console*/

// `authExpiry` is the duration in ms that localStorage auth is considered fresh for.
// If auth is older than Date.now() + authExpiry we consider it expired.
// Default is 2000ms
var authExpiry;

// `popupStayOpen` is the duration in ms that the `authorizationURI` by this helper
//  will remain open before posting its close message to the parent.
// Default is 2000ms
var popupStayOpen;

function readParams() {
	var match;

	match = /authExpiry=(\d+)/i.exec(window.location.hash);
	authExpiry = match ? Number(match[1]) : 2000;

	match = /popupStayOpen=(\d+)/i.exec(window.location.hash);
	popupStayOpen = match ? Number(match[1]) : 2000;
}

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

// If the user didn't authorize within the last N seconds, then they need to auth again
function needsAuth() {
	var authTimestamp = new Date(Number(localStorage.getItem("fake.auth.time"))); // new Date(0) if never authorized
	return (Date.now() - authTimestamp) > authExpiry;
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
					authorizationURI: resolveURL("./return.html#popupStayOpen=" + popupStayOpen),
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

// main
readParams();
window.addEventListener("message", receiveMessage, false);
