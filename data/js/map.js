var F = Raphael.format;


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

    this.fire = function(_arg) {
       var user =  this.users[_arg.uid];
       user.fire();
    };

    this.drop_user = function(_arg) {
        var user =  this.users[_arg.uid];

        var hex = this.cells[user.x][user.y];
        hex.free();

        user.img.remove();

        this.users[_arg.uid] = undefined;
    };

    this.set_self = function(_arg) {
        this.user_self = _arg.uid;
    };

    this.add_user = function(_arg, y, img) {
        var x ;
        var uid;

        if (typeof(_arg) == 'object') {
            x = _arg.x;
            y = _arg.y;
            img = _arg.char;
            uid = _arg.uid;
        } else {
            x = _arg;
            uid = this._user;
        }

        if(this.users[uid])
            return;

        var img_o = undefined;

        if(img !== undefined) {
            img_o = new Sprite("char", img, x * HEX_W, y * HEX_H, 100, 40);
            img_o._img = img;
            img_o._sprite_x_off = 0;
            img_o._sprite = 0;

        }

        _img = img_o;

        var user = new User(uid, x, y, img_o);

        this.users[uid] = user;

        var hex = this.cells[user.x][user.y];
        console.log(F("hex: {0}, {1}x{2}",
                [hex, user.x, user.y]));
        hex.use(user);

        return user;

    };

    this.move = function(_arg, o_x, o_y) {

        var user =  this.users[_arg.uid];
        o_x = _arg.ox;
        o_y = _arg.oy;

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
        user.hex = next;

        if(user.img != undefined) {
            var sprite_x_off = user.img._sprite_x_off;

            if(o_x > 0) {
                sprite_x_off = -30;
                user.img.dir(1);

            } else if (o_x < 0) {
                sprite_x_off = 0;
                user.img.dir(0);
            }


            user.img.sprite_cycle("go", 150);

            user.img.animateAlong(F("M{0},{1}L{2},{3}",[

                    (old.col * HEX_W)+user.img._sprite_x_off,
                    old.row * HEX_H,

                    (next.col * HEX_W)+sprite_x_off,
                    next.row * HEX_H
                    ]), 
                    800,
                    false,
                    function() {
                        user.img.sprite_cycle_stop();
                    }
            );

            user.img._sprite_x_off = sprite_x_off;

            user.img.sprite("base");

            user.img.toFront();
        }

        if(this.user_self == user.uid)
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

            hex = new Hex(x, y+_y,  HEX_W, HEX_H);

            hex.back_img_name = 'grass';
            hex.col = col;
            hex.row = _row;
            hex.map = this;

            this.cells[col][_row] = hex;

            hex.draw();
            hex.free();
            hex.gen = id;
        };

        for(var col=start_col; col<cols; col+=2) {
                if((this.cells[col] === undefined)) {
                        this.cells[col] = [];
                }

                for(row=start_row; row<rows; row+=2) {
                    draw_row(col, row);
                }

        }

        this.lock = false;
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
                hex.back_img.remove();

                if(hex.used && hex.used.img)
                    hex.used.img.remove();

            } else {

                if(hex.img) {
                    hex.img.translate(move_x, move_y);
                    console.log(F("move {0}x{1} img {2}x{3} = {4}",
                            [hex.col, hex.row,
                            move_x, move_y,
                            hex.img._img
                            ]))
                }

                if(hex.back_img) {
                    hex.back_img.translate(move_x, move_y);

                }

            }

        };

        var col_start = x - this.cols,
            col_end = x + this.cols,
            start_row = y - this.rows,
            end_row = y + this.rows,
            col_n, row_n;

        for(col_n=col_start; col_n<col_end; col_n++) {

            var col = this.cells[col_n];

            if(col==undefined) {
                continue;
            }

            for(row_n=start_row; row_n<end_row; row_n++) {
                move_or_drop(col_n, row_n);
            }

        }

        this.center = [x, y];
        this.add_hexes(2);
    }


    return this;
};



