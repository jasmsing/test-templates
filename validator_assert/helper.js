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
	var lastError = {
		status: "error",
		statusCode: 500,
		description: msg
	};
	respond(event, "respond with error", lastError);
}

var populateCount = 0;
var lastError;

function receiveMessage(event) {
	if (!event.data) {
		return
	}
	consoleLog("received: " + JSON.stringify(event.data));

	// If we fail at any point, stay failing
	if (lastError) {
		respond(event, "respond", lastError);
		return;
	}

	if (event.data.request === 'authenticate') {
		respond(event, "respond auth ", {
			statusCode: 200
		});
	} else if (event.data.request === 'populate') {
		var props = event.data.properties;
		var fail = false;

		populateCount++;
		if (populateCount === 1) {
			// Initial populate, every field has its default value
			fail = fail || assertValues(event, props, { foo: "", bar: "honk" });
		} else if (populateCount === 2) {
			// Populate after edit, values are set by the 'user'
			fail = fail || assertValues(event, props, { foo: "foo2", bar: "honk2" });
			fail = fail || assertChanged(event, props.foo);
		}
		if (fail) {
			return;
		}

		// otherwise respond ok
		respond(event, "respond populate", event.data.properties);
	} else if (event.data.request === 'validate') {
		respond(event, "respond validate ", {});
	}
}

// Check that `changed == true` was provided when a value was modified
// returns false if fialed
function assertChanged(event, obj) {
	if (!obj.changed) {
		respondErr(event, "Expected a `changed == true` field in " + JSON.stringify(obj))
		return true;
	}
	return false;
}

// returns false if failed
function assertValues(event, props, expected) {
	return Object.keys(expected).some(function(prop) {
		var want = expected[prop];
		var got = props[prop].value;
		if (want !== got) {
			respondErr(event, "Wanted " + prop + ".value == '" + want + "', got " + JSON.stringify(props[prop]))
			return true;
		}
		return false;
	});
}

window.addEventListener("message", receiveMessage, false);
