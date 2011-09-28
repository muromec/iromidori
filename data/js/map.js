var Map = function(rows, cols) {
    this.cells = [];
    this.users = new Object();
    this._user = 0;

    this.rows = rows;
    this.cols = cols;

    this.width = Math.ceil(window.innerWidth/(cols/2)/HEX_W);
    this.height = Math.ceil(window.innerHeight/(rows/2)/HEX_H);

    this._waits = 0;

    var shift_x = Math.round(cols/3);
    var shift_y = Math.round(rows/3);

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

        var user = new User(uid, x, y, img);
        user.draw();

        var hex = (this.cells[user.x] || [])[user.y];
        this.users[uid] = user;

        console.log(F("hex: {0}, {1}x{2}",
                [hex, user.x, user.y]));

        if(hex) {
            user.show(x, y, this.vp[0]);

            hex.use(user);
            user.hex = hex;
        } else {
            user.hide();
        }


        return user;

    };

    this.move = function(_arg, new_x, new_y) {

        var user =  this.users[_arg.uid];
        new_x = _arg.x
        new_y = _arg.y;

        if(this.lock) {
            return;
        }

        if(user.x!==undefined) {
            var old = user.hex;
            old.free();
        }

        var next = null;
        
        var col = this.cells[new_x] || [];

        next = col[new_y];

        if(!next) {
            console.log("gone out");
            user.hide();
            return;
        }

        next.use(user);

        console.log(F("move from {0}x{1} to {2}x{3}",
                    [user.x, user.y, next.col, next.row]));

        user.hex = next;

        if(user.x==undefined) {
            if(!next.vp.hidden)
                user.show(new_x, new_y, next.vp);
        } else {
            user.move(new_x, new_y, next.vp);
        }

    };

    this.recenter = function(move_dir) {
        console.log("recenter");

        var to_drop = [],
            new_draw = [];


        if(move_dir==this.width) {
            console.log("move down");
            for(var id=0; id<this.width; id++) {
                to_drop[id] = true;
                new_draw[this.vp.length - 1 - id] = true;
            }

        } else if(move_dir==-this.width) {
            console.log("move up");

            for(var id=0; id<this.width; id++) {
                to_drop[this.vp.length - 1 - id] = true;
                new_draw[id] = true;
            }

        } else if(move_dir==1) {
            console.log("move right ");

            for(var id=0; id<this.height; id++) {
                to_drop[id * this.width] = true;
                new_draw[(id * this.width) + this.width -1] = true;
            }
        } else if(move_dir==-1) {
             console.log("move left");
            for(var id=0; id<this.height; id++) {
                new_draw[id * this.width] = true;
                to_drop[(id * this.width) + this.width -1] = true;
            }
        }

        console.log(F("move dir {0}", [move_dir]));
        console.log( new_draw);
        var map_vp = [];

        for(var id=0; id<this.vp.length; id++) {

            var vp = this.vp[id], _vp;
            if(to_drop[id] == true) {
                console.log(F("hide {0}", [id]));

                vp.hide();
                continue;
            }

            console.log(F("move {0} draw={1}", [id, new_draw[id]]));
            _vp = vp.move(move_dir, !new_draw[id]);
            map_vp[vp.id] = vp;

            if(new_draw[id]) {
                _vp.draw(id);
                _vp.prefetch_around();

                map_vp[_vp.id] = _vp;
            }
        }

        this.vp = map_vp;
    };

    return this;
};
