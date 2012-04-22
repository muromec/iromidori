HEX_W = 21;
HEX_W_FULL = 60;
HEX_H = 16;

var draw_map = function(el) {
    // set global
    paper = Raphael(el, window.innerWidth, window.innerHeight);

    var row, rows = 24,
        col, cols = 32;

    var map = Map(rows, cols);
    map.vpc = new VPCache();

    console.log(F("vps: {0}x{1}", [map.width, map.height]));

    var vp = new ViewPort(map, 0, 0, cols/2, rows/2);
    vp.id = 0;

    map.vp = [vp];
    while(map.vp.length < (map.width * map.height)) {

        if((vp.id % map.width) < (map.width-1)) {
            console.log("row+ "+vp.id);
            vp = vp.right();

        } else {
            console.log("next row "+vp.id);
            vp = map.vp[map.vp.length - map.width].bottom();
        }

        vp.id = map.vp.length;
        map.vp.push(vp);
    }

    var draw_vp = function(vp) {
        map.vpc.prefetch(vp.col, vp.row, function() {
            vp.draw()
            vp.prefetch_around();
        })
    }
    for(var id=0; id<map.vp.length; id++) {
        draw_vp(map.vp[id]);
    }

    var move = function(ox, oy) {
        server.push({"ox": ox, "oy": oy, "url": "/move"})
    };


    key('l', function() {move(2, 1)});
    key('o', function() {move(2, -1)});

    key('h', function() {move(-2, 1)});
    key('y', function() {move(-2, -1)});

    key('j', function() {move(0, 2)});
    key('k', function() {move(0, -2)});

    key("up", function() {map.recenter(-map.width)});
    key("down", function() {map.recenter(map.width)});
    key("left", function() {map.recenter(-1)});
    key("right", function() {map.recenter(1)});

    key('f', function() {
        server.push({"url": "/fire"})
    } );

    server = new Server();
    server.cb = function(data) {
        console.log("got "+data.fn);
        map[data.fn](data.data);
    }
    var enter_now = function(char_data) {
        server.connect();
        server.push({"url": "/enter", "char_type": char_data.type});
    }

    var enter = EnterControl(enter_now);
    enter.fetch();

}
