var Server = function() {

    var path = window.location.toString();
    var start = path.indexOf(":"),
        end = path.indexOf("/", start+3);
    var domain = path.substr(start+3, end-start-3);
    console.log(domain);

    var ws = new WebSocket(F("ws://{0}/events", [domain]));
    console.log(ws);

    ws.onopen = function() {
         ws.push({"url": "/enter"})
    };

    ws.onmessage = function (evt) {
         var data = JSON.parse(evt.data);

         if(ws.cb)
             ws.cb(data);
    };

    ws.push = function(data) {
        ws.send(JSON.stringify(data));
    };

    return ws;
}