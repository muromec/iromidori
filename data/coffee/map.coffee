class MMap
    constructor: (@rows, @cols) ->
        @cells = [];
        @users = new Object();
        @_user = 0;

        @width = Math.ceil(window.innerWidth/cols/HEX_W);
        @height = Math.ceil(window.innerHeight/rows/HEX_H);

        @_waits = 0;

        @vp = []
        
        @base_loc = window.location.toString()
        if @base_loc.indexOf('#') > -1
            @base_loc = @base_loc.substr(0, @base_loc.indexOf('#'))

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
        @user_self = _arg.uid;

    add_user: (_arg, y, img) ->
        
        uid = _arg.uid
        if this.users[uid]
            return;

        user = new User(uid, _arg.img, _arg.name, _arg.stat)
    
        hex = (this.cells[_arg.x] || [])[_arg.y];
        @users[uid] = user;

        if hex
            user.show(_arg.x, _arg.y, @vp[0])
            hex.use(user);
        else
            user.hide(_arg.x, _arg.y)
            user.vp = 
                col: Math.floor(_arg.x/@cols) * @cols
                row: Math.floor(_arg.y/@rows) * @rows
                id: "nowhere"
                hidden: true

            @recenter(0)

        if uid == @user_self
            @self_stat(user)

        if uid == @user_self and hex
            @recenter(0)
            @set_pos(user.vp)

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

        console.log("user mvoing #{new_x}x#{new_y}")
        if old
            old.free();

        if !next or next.vp.hidden
            console.log("gone out");
            user.hide(new_x, new_y)
            user.vp =
                col: Math.floor(new_x/@cols) * @cols
                row: Math.floor(new_y/@rows) * @rows

            if user.uid == @user_self
                @recenter(0)

            return;

        user.vp = next.vp
        if user.hidden
            console.log("show from nowhere!")
            user.show(new_x, new_y, next.vp);
            next.use(user);
        else
            user.move(new_x, new_y, next.vp)

            next.use(user);

        if old and old.vp != user.vp
            @set_pos(old.vp)

    set_pos: (vp) ->
        window.location = "#{@base_loc}##{vp.col}x#{vp.row}"

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
            user.hidden = user.vp.hidden
            user.taint = true
            console.log("user #{user.id}")
            if not user.hex
                console.log("no hex #{user.x}x#{user.y}")
                hex = (this.cells[user.x] || [])[user.y];
                if hex
                    console.log("found hex #{hex.col}x#{hex.row}")
                    user.show(hex.col, hex.row, hex.vp)
                    hex.use(user);

            if user.vp.hidden
                user.vp.id = 
                    id: "nowhere"
                    hidden: true
                    col: user.vp.col
                    row: user.vp.row


    recenter: (move_dir) ->
        console.log("recenter #{move_dir}");

        if move_dir == 0
            user = @users[@user_self]
            if user.vp.id == @vp[0].id
                console.log("nope")
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
        @set_pos(vp)

        console.log("recentered to #{vp.col}x#{vp.row}")
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
            vp = new ViewPort this, col, row, @cols, @rows

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
