HEX_W = 21;
HEX_W_FULL = 60;
HEX_H = 16;

var draw_map = function(el) {
    // set global
    paper = Raphael(el, 1100, 600);
    paper.hex = function(x, y) {
        return new Hex(paper, x, y, HEX_W, HEX_H);
    }

    var row, rows = 24,
        col, cols = 32;

    var map = Map(rows, cols);
    map.paper = paper;
    map.add_hexes(1);

    var user = null;

    var server = new Server();


    key('l', function() {map.move(user, 2, 1)});
    key('o', function() {map.move(user, 2, -1)});

    key('h', function() {map.move(user, -2, 1)});
    key('y', function() {map.move(user, -2, -1)});

    key('j', function() {map.move(user, 0, 2)});
    key('k', function() {map.move(user, 0, -2)});

    key('f', function() {user.fire()});


    key('i', function() {
        user = map.add_user(8, 8, 'faery');
    });
}
