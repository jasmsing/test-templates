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

function respondErr(event, msg) {
	respond(event, "respond with error", {
		status: "error",
		statusCode: 500,
		description: msg
	})
}

var barChecked = false;

function receiveMessage(event) {
	if (!event.data) {
		return
	}
	consoleLog("received: " + JSON.stringify(event.data));
	if (event.data.request === 'authenticate') {
		respond(event, "respond auth ", {
			statusCode: 200
		});
	} else if (event.data.request === 'populate') {
		var props = event.data.properties;

		// check for problems
		if (errChangedMissing(event, props)) {
			return;
		}
		if (errValuesBad(event, props)) {
			return;
		}

		// otherwise respond ok
		respond(event, "respond populate", event.data.properties);
	} else if (event.data.request === 'validate') {
		respond(event, "respond validate ", {
			description: "This is an error returned from validate"
		});
	}
}

// Check that `changed == true` was provided when a value was modified
function errChangedMissing(event, props) {
	var bar = props.bar;
	// Hack: we know bar's initial value was "honk". The first time it changes from "honk",
	// verify that the `changed` flag was sent
	if (bar && bar.value !== "honk") {
		if (!barChecked && !bar.changed) {
			respondErr(event, "Expected bar.changed == true but found " + JSON.stringify(props.bar))
			return true; //handled
		}
		barChecked = true;
	}
	return false;
}

function errValuesBad(event, props) {
	if (props.foo.value !== "foo0") {
		respondErr("Expected foo.value == 'foo0', found: " + JSON.stringify(props.foo));
		return true;
	}
	return false;
}

window.addEventListener("message", receiveMessage, false);
