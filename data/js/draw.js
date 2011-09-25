HEX_W = 21;
HEX_W_FULL = 60;
HEX_H = 16;

var draw_map = function(el) {
    // set global
    paper = Raphael(el, 800, 600);

    var row, rows = 24,
        col, cols = 32;

    var map = Map(rows, cols);

    var vp0 = new ViewPort(map, 0, 0, cols/2, rows/2);
    vp0.y = 20;
    vp0.draw();
    console.log("vp1");
    vp1 = vp0.right();
    vp1.draw();
    console.log("vp2");
    vp2 = vp0.bottom();
    vp2.draw();
    console.log("vp3");
    vp3 = vp1.bottom();
    vp3.draw();

    map.vp = [vp0, vp1, vp2, vp3];

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

    var server = new Server();
    server.cb = function(data) {
        console.log("got "+data.fn);
        map[data.fn](data.data);
    }
    var enter_now = function(char_data) {
        server.push({"url": "/enter", "char_type": char_data.type});
    }

    var enter = EnterControl(enter_now);
    enter.fetch();

}
