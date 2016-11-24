/*eslint-env node, browser*/

function consoleLog(msg) {
	if (window && window.debug_level) {
		console.log(msg);
	}
}

function respond(event, msg, response) {
	var rc = {
		request: event.data.request,
		service_id: event.data.service_id,
		response: response
	};
	consoleLog(msg + JSON.stringify(rc));
	event.source.postMessage(rc, "*");
	return response;
}

var barChecked = false;

function receiveMessage(event) {
	if (!event.data) {
		return
	}
	consoleLog("received: " + JSON.stringify(event.data));
	if (event.data.request === 'authenticate') {
		respond(event,"respond auth ", {
			statusCode: 200
		});
	} else if (event.data.request === 'populate') {
		// var rc = {
		// 	request: event.data.request,
		// 	response: event.data.properties
		// };
		// event.source.postMessage(rc, "*");

		var props = event.data.properties;
		var bar = props.bar;
		// Hack: we know bar's initial value was "honk". The first time it changes from "honk",
		// verify that the `changed` flag was sent
		if (bar && bar.value !== "honk") {
			if (!barChecked && !bar.changed) {
				respond(event, "respond populate", {
					status: "error",
					statusCode: 500,
					description: "Expected bar.changed == true but found " + JSON.stringify(props.bar)
				});
			}
			barChecked = true;
			return;
		}

		// respond ok
		respond(event, "respond populate", event.data.properties);
	} else if (event.data.request === 'validate') {
		respond(event, "respond validate ", {
			description: "This is an error returned from validate"
		});
	}
}

window.addEventListener("message", receiveMessage, false);
