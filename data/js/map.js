var F = Raphael.format;

var Hex = function(paper, x, y, w, h) {
    var f1 = w / 7 * 6,
        f2 = w / 7 * 8;

    var hex = paper.path(
        Raphael.format(
            "M{0} {1}l{2} {4}l{3} 0l{2} -{4}l-{2} -{4}l-{3} 0z", [x, y, f1, f2, h]));
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
       alert(hex.gen);

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

    this.rows = rows;
    this.cols = cols;
    this.center = [Math.round(cols/4)*2, Math.round(rows/4)*2];

    var shift_x = Math.round(cols/3);
    var shift_y = Math.round(rows/3);

    for(col=0;col<cols;col++) {
        this.cells[col] = [];
    }

    this.add_user = function(x, y) {
        this._user++;

        var uid = this._user;

        var user = new User(uid, x, y);

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
        console.log(F("next hex get {0}", [next.gen]));

        console.log(F("next {0}x{1} @{2} {3}x{4}", [
                    o_x, o_y, next, user.x + o_x, user.y+o_y]));

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

        this.recenter(user.x, user.y);

    };

    this.add_hexes = function(id) {
        var cols = this.center[0] + Math.round(this.cols/2),
            rows = this.center[1] + Math.round(this.rows/2);

        var start_row = rows - this.rows,
            start_col = cols - this.cols;

        console.log("start_col "+start_col);

        for(var col=start_col; col<cols; col+=2) {

            if((this.cells[col] === undefined)) {
                    this.cells[col] = [];
                    console.log("create col " + col);
            }

            for(row=start_row; row<rows; row+=2) {
                var y = ((row-start_row) * HEX_H) + 40, _y = 0;
                var _row = 0;


                if((col % 4)!=0) {
                    _y = HEX_H;
                    _row = row + 1;

                } else {
                    _y = 0;
                    _row = row;
                }


                var hex = this.cells[col][_row];
                if(hex !== undefined) {
                    hex.show();
                    continue;
                }

                console.log(F("create {0}x{1}", [col, _row]));

                var x = (col-start_col) * HEX_W;

                hex = this.paper.hex(x, y + _y);
                hex.text = this.paper.text(x + HEX_H, y + _y , Raphael.format("{0}x{1}", [col, _row]));
                hex.col = col;
                hex.row = _row;

                this.cells[col][_row] = hex;

                hex.free();
                hex.gen = id;
            }
        }

    };

    this.recenter = function(x, y) {
        var cx = this.center[0],
            cy = this.center[1];

        var _off_x = cx - x,
            _off_y = cy - y;

        var off_x = _off_x,
            off_y = _off_y;

        if(off_x < 0)
            off_x = - off_x;

        if(off_y < 0)
            off_y = - off_y;

        if((off_x < shift_x) && (off_y < shift_y))
            return;

        var move_x = _off_x * HEX_W,
            move_y = _off_y * HEX_H;

        var col_lim = this.cells.length;

        var move = function(col_n) {
            var col_off = col_n - x;

            if(col_off < 0)
                col_off = -col_off;

            var drop_col = (col_off > shift_x);

            var move_col = function() {

                clearInterval(move_col.stop);

                var col = this.cells[col_n];


                for(var row_n=0; row_n < col.length; row_n++) {

                    var row_off = row_n - y;
                    if(row_off <0)
                        row_off = - row_off;

                    var drop_row = (row_off > shift_y);

                    var hex = col[row_n];

                    if(!hex)
                        continue;

                    if(drop_col || drop_row) {

                        hex.text.hide()
                        hex.hide()

                        //col.splice(row_n, 1);
                    } else {
                        hex.translate(move_x, move_y);
                        hex.text.translate(move_x, move_y);

                    }

                }

                /*
                if(drop_col) {
                    this.cells.splice(col_n, 1);
                } */

                if(this.cells[col_n+1]) {
                    move(col_n+1);
                } else {
                    this.center = [Math.round(x/2)*2, Math.round(y/2)*2];
                    this.add_hexes(2);
                }


            }

            move_col.stop = window.setInterval(move_col, 0);
        }

        move(0);


    };

    return this;
};

var User = function(uid, x, y) {
    this.x = x;
    this.y = y;
    this.uid = uid;

    return this;
};

HEX_W = 21;
HEX_H = 16;

var draw_map = function(el) {
    var paper = Raphael(el, 1100, 600);
    paper.hex = function(x, y) {
        return new Hex(paper, x, y, HEX_W, HEX_H);
    }

    var row, rows = 24,
        col, cols = 32;

    var map = Map(rows, cols);
    map.paper = paper;
    map.add_hexes(1);
    alert(map.center);


    var user = map.add_user(8, 8);

    key('l', function() {map.move(user, 2, 1)});
    key('o', function() {map.move(user, 2, -1)});

    key('h', function() {map.move(user, -2, 1)});
    key('y', function() {map.move(user, -2, -1)});

    key('j', function() {map.move(user, 0, 2)});
    key('k', function() {map.move(user, 0, -2)});

}
