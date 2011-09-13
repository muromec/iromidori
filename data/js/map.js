var F = Raphael.format;

var Hex = function(paper, x, y, w, h) {
    var f1 = w / 7 * 6,
        f2 = w / 7 * 8;

    var hex = paper.path(
        Raphael.format(
            "M{0} {1}l{2} {4}l{3} 0l{2} -{4}l-{2} -{4}l-{3} 0z", [x, y, f1, f2, h]));
    hex.attr("fill", "#fff");

    hex.used = false;

    hex._hl = function(off_x, off_y, color) {
        var col = this.map.cells[hex.col+off_x];
        if(col===undefined)
            return;

        var _hex = col[hex.row+off_y];

        if(_hex === undefined)
            return;

        if(_hex.used)
            return;

        if(color===undefined)
            color=_hex._color;

        _hex._color = _hex.attrs.fill;

        _hex.attr("fill", color);

    };

    hex.halo = function(color) {
       hex._hl(0, +2, color);
       hex._hl(0, -2, color);
       hex._hl(2, +1, color);
       hex._hl(2, -1, color);
       hex._hl(-2, +1, color);
       hex._hl(-2, -1, color);

    };

    hex.use = function (whom) {
       hex.attr("fill", 'red');
       hex.text.hide();

       hex.used = whom;

       if(whom != undefined && whom.img != undefined)
           hex.img = whom.img;

       if(whom!==true)
           hex.halo('yellow');

    };

    hex.free = function() {
       hex.attr("fill", 'green');
       hex.text.show();
       hex.used = false;
       hex.img = false;

       hex.halo();

    };

    hex.node.onclick = function() {

       hex.use(true);
       hex.attr("fill", "blue");
       console.log(F("click on hex gen {0} at {1}x{2}",[
                   hex.gen, hex.col, hex.row]));

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
    this.center = [cols/4*2, rows/4*2];

    this.lock = true;
    this._waits = 0;

    var shift_x = Math.round(cols/3);
    var shift_y = Math.round(rows/3);

    for(col=0;col<cols;col++) {
        this.cells[col] = [];
    }

    this.add_user = function(x, y, img) {
        this._user++;

        var uid = this._user;
        var img_o = undefined;

        if(img !== undefined) {
            img_o = this.paper.image(F("/img/char/{0}_{1}.png",[img, 0]), x * HEX_W, y * HEX_H, 100, 40);
            img_o._img = img;
            img_o._sprite_x_off = 0;
            img_o._sprite = 0;

            img_o.node.onclick = function() {
                alert(img_o._img);
            }
        }

        _img = img_o;

        var user = new User(uid, x, y, img_o);

        this.users[uid] = user;

        var hex = this.cells[user.x][user.y];
        hex.use(user);

        return user;

    };

    this.move = function(user, o_x, o_y) {


        if(this.lock) {
            return;
        }

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
        next.use(user);

        console.log(F("move from {0}x{1} to {2}x{3}",
                    [user.x, user.y, next.col, next.row]));

        user.x = next.col;
        user.y = next.row;

        if(user.img != undefined) {
            var sprite = user.img._sprite,
                sprite_x_off = user.img._sprite_x_off;

            if(o_x > 0) {
                sprite = 1;
                sprite_x_off = -30;

            } else if (o_x < 0) {
                sprite = 0;
                sprite_x_off = 0;
            }

            user.img.attr("src", F("/img/char/{0}_{1}.png",[user.img._img, sprite]));

            user.img.animateAlong(F("M{0},{1}L{2},{3}",[

                    (old.col * HEX_W)+user.img._sprite_x_off,
                    old.row * HEX_H,

                    (next.col * HEX_W)+sprite_x_off,
                    next.row * HEX_H
                    ]), 
                    100
            );
            user.img._sprite_x_off = sprite_x_off;
            user.img._sprite = sprite;

            user.img.toFront();
        }

        this.recenter(user.x, user.y);

    };

    this.add_hexes = function(id) {
        var cols = this.center[0] + this.cols/2,
            rows = this.center[1] + this.rows/2;

        var start_row = rows - this.rows,
            start_col = cols - this.cols;

        var draw_row = function(col, row) {
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
                return;
            }

            //console.log(F("create {0}x{1}", [col, _row]));

            var x = (col-start_col) * HEX_W;

            hex = this.paper.hex(x, y + _y);
            hex.text = this.paper.text(x + HEX_H + 5, y + _y , Raphael.format("{0}x{1}", [col, _row]));
            hex.col = col;
            hex.row = _row;
            hex.map = this;

            this.cells[col][_row] = hex;

            hex.free();
            hex.gen = id;
        };

        var draw_col = function(col) {
            var _draw_col = function() {

                clearInterval(_draw_col.stop);

                if((this.cells[col] === undefined)) {
                        this.cells[col] = [];
                        //console.log("create col " + col);
                }

                for(row=start_row; row<rows; row+=2) {
                    draw_row(col, row);
                }

                if(col<cols) {
                    draw_col(col+2)
                } else {
                    this.lock = false;
                }
            }

            _draw_col.stop = window.setInterval(_draw_col);
        }

        draw_col(start_col);

    };

    this.recenter = function(x, y) {
        var cx = this.center[0],
            cy = this.center[1];

        x = Math.round(x / 4) * 4;
        y = Math.round(y / 4) * 4;

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

        this.lock = true;

        var move_x = _off_x * HEX_W,
            move_y = _off_y * HEX_H;


        var move_or_drop = function(col_n, row_n) {
            var hex = this.cells[col_n][row_n];

            if(hex===undefined)
                return;

            var col_off = hex.col - x;

            if(col_off < 0)
                col_off = -col_off;

            var drop_col = (col_off > shift_x);

            var row_off = hex.row - y;
            if(row_off <0)
                row_off = - row_off;

            var drop_row = (row_off > shift_y);

            //console.log(F("hex {0}x{1} drop {2}/{3}", [hex.col, hex.row, drop_col, drop_row]));


            if(drop_col || drop_row) {

                this.cells[hex.col][hex.row] = undefined;
                hex.attr("fill", "black");
                hex.text.remove();
                hex.remove();



                //col.splice(row_n, 1);
            } else {
                hex.translate(move_x, move_y);
                hex.text.translate(move_x, move_y);

                if(hex.img)
                    hex.img.translate(move_x, move_y);

            }

        };

        var col_lim = x + this.cols;

        var move = function(col_n) {

            var move_col = function() {

                clearInterval(move_col.stop);

                var col = this.cells[col_n];
                var start_row = y - this.rows;
                var end_row = y + this.rows;

                if(col==undefined)
                    start_row = end_row;

                for(var row_n=start_row; row_n < end_row; row_n++) {
                    move_or_drop(col_n, row_n);
                }

                if(col_n < col_lim) {
                    move(col_n+1);
                } else {
                    this.center = [x, y];
                    this.add_hexes(2);
                    //this.lock = false;
                }


            }

            move_col.stop = window.setInterval(move_col, 0);
        }

        move(x - this.cols);


    };

    return this;
};

var User = function(uid, x, y, img) {
    this.x = x;
    this.y = y;
    this.uid = uid;

    this.img = img;

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

    var user = null;



    key('l', function() {map.move(user, 2, 1)});
    key('o', function() {map.move(user, 2, -1)});

    key('h', function() {map.move(user, -2, 1)});
    key('y', function() {map.move(user, -2, -1)});

    key('j', function() {map.move(user, 0, 2)});
    key('k', function() {map.move(user, 0, -2)});

    key('i', function() {
        user = map.add_user(8, 8, 'faery');
    });
}
