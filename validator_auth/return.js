/*eslint-env browser*/
/*eslint-disable no-console*/
var match = /popupStayOpen=(\d+)/i.exec(window.location.hash);
var stayOpen = match ? Number(match[1]) : 2000;

var msg = {
	"request": "oauth-return",
	"response": true
};

if (window.parent) {
	// console.log("Returned from OAuth: " + window.opener.location);
	setTimeout(function() {
		if (!window.opener) {
			console.error("No window.opener - not opened as a popup?");
			return;
		}
		window.opener.postMessage(msg, "*");

		// set the auth timestamp in local storage for this domain
		localStorage.setItem("fake.auth.time", Date.now());
	}, stayOpen)
}

function receiveMessage(event) {
	console.log("data: " + JSON.stringify(event.data) + "\norigin: " + event.origin);
	if (event.data) {
		if (event.data.request === 'close') {
			window.opener.focus();
			window.close();
		}
	}
}

window.addEventListener("message", receiveMessage, false);