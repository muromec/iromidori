class MMap
    constructor: (@rows, @cols) ->
        @cells = [];
        @users = new Object();
        @_user = 0;

        @width = Math.ceil(window.innerWidth/(cols/2)/HEX_W);
        @height = Math.ceil(window.innerHeight/(rows/2)/HEX_H);

        @_waits = 0;

        @shift_x = Math.round(cols/3);
        @shift_y = Math.round(rows/3);
        @vp = []

    fire: (_arg) ->
       user =  @users[_arg.uid];
       user.fire();

    err: (msg) -> alert msg

    drop_user: (_arg) ->
        user =  @users[_arg.uid];

        hex = @cells[user.x][user.y];
        hex.free();

        user.img.remove();

        @users[_arg.uid] = undefined;


    set_self: (_arg) ->
        @user_self = _arg.uid;

    add_user: (_arg, y, img) ->

        if typeof(_arg) == 'object'
            x = _arg.x;
            y = _arg.y;
            img = _arg.char;
            uid = _arg.uid;
        else
            x = _arg;
            uid = this._user;


        if this.users[uid]
            return;

        user = new User(uid, x, y, img)
        user.draw();

        hex = (this.cells[user.x] || [])[user.y];
        @users[uid] = user;

        if hex
            user.show(@vp[0])

            hex.use(user);
            user.hex = hex;
        else
            user.hide();

        return user;

    move: (_arg, new_x, new_y) ->

        user =  @users[_arg.uid];
        new_x = _arg.x
        new_y = _arg.y;

        if this.lock
            return;

        if user.x!=undefined
            old = user.hex;
            taints = [old]
            for xoff in [-2, 0, 2]
                col = @cells[user.x + xoff] || []
                if ! col
                    break

                # XXX: buggy tiles. should be [-1, 1]
                for yoff in [-2, -1, 1, 2]
                    _hex = col[user.y + yoff]
                    if _hex
                        taints.push(_hex)
        else
            old = false

        next = null;
        col = @cells[new_x] || [];
        next = col[new_y];

        if !next
            console.log("gone out");
            user.hide();
            return;

        if user.x==undefined
            if !next.vp.hidden
                user.show(new_x, new_y, next.vp);
                next.use(user);
        else
            user.move(new_x, new_y, next.vp, taints || []);

            if old
                old.free();

            next.use(user);

    draw_map: (ps) =>
        console.log("draw #{this}..#{@vp}")
        map_vp = @vp
        ps.setup = () ->
            ps.size($(window).width(), $(window).height())
            ps.background(0)
            ps.frameRate(4)
            ps.clear = true

        ps.draw = () =>
            for vp in map_vp
                for hex in vp.hexes
                    if hex.taint or ps.clear
                        hex.draw()

            ps.clear = false

    draw_fg: (ps) =>
        console.log("draw fg #{this}..#{@vp}")
        map_vp = @vp
        ps.setup = () ->
            ps.size($(window).width(), $(window).height())
            ps.background(0, 0.5)

        ps.draw = () =>
            clear = true
            for user_id in Object.keys(@users)
                if @users[user_id].taint

                    if clear
                        ps.background(0, 0.5)
                        clear = false

                    @users[user_id].draw()

    recenter: (move_dir) ->
        console.log("recenter");

        ###
        to_drop = [],
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
        ###
