var Map = function(rows, cols) {
    this.cells = [];
    this.users = new Object();
    this._user = 0;

    this.rows = rows;
    this.cols = cols;
    this.center = [cols/4*2, rows/4*2];

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

    };

    return this;
};
