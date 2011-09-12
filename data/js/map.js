var F = Raphael.format;

var Hex = function(paper, x, y) {
    var hex = paper.path(Raphael.format("M{0} {1}l30 25l40 0l30 -25l-30 -25l-40 0z", [x, y]));
    hex.attr("fill", "#fff");

    hex.used = false;

    hex.use = function (whom) {
       hex.attr("fill", 'red');
       hex.text.hide();

       hex.used = whom;
    };

    hex.free = function() {
       hex.attr("fill", 'green');
       hex.text.show();
    };

    hex.node.onclick = function() {
       hex.use(true);
       hex.attr("fill", "blue");
    }

    hex.wtf = 'hex element';

    return hex;

};

var Map = function(rows, cols) {
    this.cells = [];
    this.users = new Object();
    this._user = 0;

    for(col=0;col<cols;col++) {
        this.cells[col] = [];
    }

    this.add_user = function() {
        this._user++;

        var uid = this._user;

        var user = new User(uid);

        this.users[uid] = user;

        var hex = this.cells[user.x][user.y];
        hex.use(user);

        return user;

    };

    this.move = function(user, o_x, o_y) {

        var next = null;
        var old = this.cells[user.x][user.y];

        console.log(F("move from {0}x{1} @ {2}",
                    [user.x, user.y, old]));

        var col = this.cells[user.x + o_x];

        next = col[user.y + o_y];

        console.log(F("next {0}x{1} @{2} {3}x{4}", [
                    o_x, o_y, next, col.length, user.y+o_y]));

        if(!next || next.used) {
            console.log("fuckup");
            return;
        }

        old.free();
        next.use();

        console.log(F("move from {0}x{1} to {2}x{3}",
                    [user.x, user.y, next.col, next.row]));

        user.x = next.col;
        user.y = next.row;


    };

    return this;
};

var User = function(uid) {
    this.x = 6;
    this.y = 6;
    this.uid = uid;

    return this;
};

var draw_map = function(el) {
    var paper = Raphael(el, 1100, 600);
    paper.hex = function(x, y) {
        return Hex(paper, x, y);
    }

    var row, rows = 20,
        col, cols = 30;

    var map = Map(rows, cols);

    for(row=0; row<rows; row+=2) {
        var y = (row * 25) + 40, _y = 0;
        var _row = 0;

        for(col=0; col<cols; col+=2) {

            if((col % 4)==0) {
                _y = 25;
                _row = row + 1;

            } else {
                _y = 0;
                _row = row;
            }

            var x = col * 35;

            var hex = paper.hex(x, y + _y);
            hex.text = paper.text(x + 25, y + _y , Raphael.format("{0}x{1}", [col, _row]));
            hex.col = col;
            hex.row = _row;

            map.cells[col][_row] = hex;

            hex.free();
        }
    }

    var user = map.add_user();

    key('l', function() {map.move(user, 2, 1)});
    key('o', function() {map.move(user, 2, -1)});

    key('h', function() {map.move(user, -2, 1)});
    key('y', function() {map.move(user, -2, -1)});

    key('j', function() {map.move(user, 0, 2)});
    key('k', function() {map.move(user, 0, -2)});

}
