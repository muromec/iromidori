var Server = function() {

    var path = window.location.toString();
    var start = path.indexOf(":"),
        end = path.indexOf("/", start+3);
    var domain = path.substr(start+3, end-start-3);
    console.log(domain);

    var ws = this;

    ws.connect = function() {
        if(ws.s) {
            console.log("already connected. wtf?");
            return;
        }

        ws.s = new WebSocket(F("ws://{0}/events", [domain]));
        ws.s.onmessage = onmessage;
        ws.s.onopen = onopen;
    }

    ws.queue = [];

    var onopen = function() {
        console.log("onopen");

        while(ws.queue.length && ws.s && ws.s.readyState == WebSocket.OPEN) {
            ws.push(ws.queue.pop())
        }

    };

    var onmessage = function (evt) {
         var data = JSON.parse(evt.data);

         if(ws.cb)
             ws.cb(data);
    };

    ws.push = function(data) {
        if(ws.s && ws.s.readyState == WebSocket.OPEN) {
            return ws.s.send(JSON.stringify(data));
        }

        ws.queue.push(data);
    };


    __server = ws;

    return ws;
}
