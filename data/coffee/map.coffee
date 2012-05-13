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
        
        window.mmap = this

    stats: (_arg) ->
        console.log(_arg)
        user =  @users[_arg.who];
        user.stat.hp = _arg.stat.hp
        user.stat.dead = _arg.dead

        if user.uid == @user_self
            @_self_stat.render()

    fire: (_arg) ->
       user =  @users[_arg.who];

       [col, row] = _arg.point
       hex = @cells[col][row]

       if _arg.target
           console.log("fired at target")
           target = @users[_arg.target.uid]

           # move out
           target.stat.hp = _arg.target.hp
           target.stat.dead = _arg.target.dead

           if target.uid == @user_self
               console.log("oh, its me! #{target.stat.hp}")
               @_self_stat.render()
               @_self_stat.warning()

       user.fire(hex)

    err: (msg) ->
        new ErrBox(msg)

    drop_user: (_arg) ->
        user =  @users[_arg.uid];

        hex = @cells[user.x][user.y];
        hex.free();

        user.img.remove();

        @users[_arg.uid] = undefined;


    set_self: (_arg) ->
        console.log("set self")
        console.log(@users[_arg.uid])
        @user_self = _arg.uid;

    add_user: (_arg, y, img) ->

        if typeof(_arg) == 'object'
            x = _arg.x;
            y = _arg.y;
            img = _arg.char;
            uid = _arg.uid;
            name = _arg.name
            stat = _arg.stat
        else
            x = _arg;
            uid = this._user;

        if this.users[uid]
            return;

        user = new User(uid, x, y, img, name, stat)
        user.draw();
        if uid == @user_self
            @self_stat(user)

        hex = (this.cells[user.x] || [])[user.y];
        @users[uid] = user;

        if hex
            user.show(@vp[0])

            hex.use(user);
            user.hex = hex;
        else
            user.hide();

        return user;

    self_stat: (user) ->
        @_self_stat = new Stat(user, "self_stat")

    move: (_arg, new_x, new_y) ->

        user =  @users[_arg.uid];
        new_x = _arg.x
        new_y = _arg.y;

        if this.lock
            return;

        if user.x!=undefined
            old = user.hex;
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
            user.move(new_x, new_y, next.vp)

            if old
                old.free();

            next.use(user);

        user.vp = next.vp

    draw_map: (ps) =>
        console.log("draw #{this}..#{@vp} #{@ri}")
        map = this
        ps.setup = () ->
            ps.size($(window).width(), $(window).height())
            ps.background(0)
            ps.frameRate(4)
            ps.clear = true

        ps.draw = () =>
            for vp in map.vp
                if vp.hidden
                    continue

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
            taint = 0
            for user_id in Object.keys(@users)
                taint = taint || @users[user_id].taint
                if taint
                    break

            if not taint
                return

            ps.background(0, 0.5)
            for user_id in Object.keys(@users)
                @users[user_id].draw()

    _recenter: ->
        window.map.clear = true
        for user_id in Object.keys(@users)
            user = @users[user_id]
            user.taint = true

    recenter: (move_dir) ->
        console.log("recenter #{move_dir}");

        if move_dir == 0
            user = @users[@user_self]
            if user.vp.id == @vp[0].id
                return

            vp = user.vp

        else if move_dir == 1
            vp = @vp[1]
        else if move_dir==-1
            vp = @vp[0].left()
        else if move_dir==@width
            vp = @vp[0].bottom()
        else if move_dir==-@width
            vp = @vp[0].top()

        @setup_vp(vp.col, vp.row)
        return @_recenter()

    setup_vp: (col, row) ->
        for vp in @vp
            console.log("hide #{vp.col}x#{vp.row}")
            vp.hide()

        key = "#{col}x#{row}"
        if @vpc.around[key]
            vp = @vpc.around[key]
            vp.x = 0
            vp.y = 0
        else
            vp = new ViewPort this, col, row, @cols/2, @rows/2

        vp.id = 0;

        map_vp = [vp]

        console.log("now add")

        while map_vp.length < (@width * @height)

            if (vp.id % @width) < (@width-1)
                console.log("row+ "+vp.id);
                vp = vp.right();
            else
                console.log("next row "+vp.id);
                vp = map_vp[map_vp.length - @width].bottom();

            vp.id = map_vp.length;
            map_vp.push(vp);


        for vp in map_vp
            vp.draw()
            vp.fetch()

        @vp = map_vp


    current_hex: ->
        vp = @vp[0]

        x = window.mouseX
        y = window.mouseY
        y += HEX_H

        col = Math.floor(x / HEX_H) + @vp[0].col
        row = Math.floor(y / HEX_W) + @vp[0].row

        if col % 2
            col -= 1

        if col % 4 and (row % 2) == 0
            row += 1
        else if row % 2 and (col % 4) == 0
            row += 1

        hex = @cells[col][row]

        return hex
