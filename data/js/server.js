var Server = function() {

    var path = window.location.toString();
    var start = path.indexOf(":"),
        end = path.indexOf("/", start+3);
    var domain = path.substr(start+3, end-start-3);
    console.log(domain);

    var ws = new WebSocket(F("ws://{0}/events", [domain]));
    console.log(ws);

    ws.onopen = function() {
        console.log("Opened");
         ws.send("Hello, world");
    };

    ws.onmessage = function (evt) {
         alert(evt.data);
    };

    return ws;
}
