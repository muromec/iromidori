HEX_W = 21;
HEX_W_FULL = 60;
HEX_H = 16;

var draw_map = function(el) {
    // set global
    paper = Raphael(el, 1100, 600);

    var row, rows = 24,
        col, cols = 32;

    var map = Map(rows, cols);
    map.paper = paper;
    map.add_hexes(1);

    var move = function(ox, oy) {
        server.push({"ox": ox, "oy": oy, "url": "/move"})
    };


    key('l', function() {move(2, 1)});
    key('o', function() {move(2, -1)});

    key('h', function() {move(-2, 1)});
    key('y', function() {move(-2, -1)});

    key('j', function() {move(0, 2)});
    key('k', function() {move(0, -2)});

    key('f', function() {
        server.push({"url": "/fire"})
    } );

    var server;

    var connect = function() {
        server = new Server();
        server.cb = function(data) {
            console.log("got "+data.fn);
            map[data.fn](data.data);
        }
    }

    var try_connect = function() {
        if(map.lock)
            return;

        clearInterval(try_connect.intr);

        connect();
    }

    try_connect.intr = setInterval(try_connect, 100);

}
