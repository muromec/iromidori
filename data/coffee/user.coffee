class User
    constructor: (@uid, @x, @y, @img_name) ->
        @hidden = true
        img = "/img/char/#{ @img_name }_0.png"
        @img = new Sprite("char", @img_name, 0)
        @off_x = 0
        @off_y = 0
        @taint = true
        @_cycle_id = null

    fire: ->
        li_to =
            x: window.fg.mouseX
            y: window.fg.mouseY

        pos = @where()

        if li_to.x < pos.x
            @img.dir(0)
        else
            @img.dir(1)

        @img.sprite_cycle("fire", 300, true);
        @taint = true

        li = new Lighting(pos, li_to, this)

    where: ->
        x = (@x - @vp.col) * HEX_W;
        y = (@y - @vp.row) * HEX_H;

        return {
            x: x + @vp.x,
            y: y + @vp.y,
        }

    show: (vp) ->
        @hidden = false;
        @vp = vp
    
    hide: ->
        @hidden = true;

    move: (new_x, new_y, vp, taints) ->

        #sprite_x_off = @img._sprite_x_off;

        if (@x - new_x) < 0
            sprite_x_off = -30;
            @img.dir(1);

        else if (@x - new_x) > 0
            sprite_x_off = 0;
            @img.dir(0);

        @img.sprite_cycle("go", 150)
        @taint = true

        old_pos = @where()

        @x = new_x;
        @y = new_y;

        new_pos = @where()
        @off_x = old_pos.x - new_pos.x
        @off_y = old_pos.y - new_pos.y

        cycle_tick = =>
            if @off_y > 0
                @off_y -= 1
            else if @off_y < 0
                @off_y += 1

            if @off_x > 0
                @off_x -= 1
            else if @off_x < 0
                @off_x += 1

            if @off_x==0 and @off_y ==0
                clearInterval(@_cycle_id)
                @_cycle_id = null

                @img.sprite_cycle_stop()

            """
            for hex in taints
                hex.taint = true
            """
            false

        if ! @_cycle_id
            @_cycle_id = setInterval(cycle_tick, 15)



    draw: ->

        if ! @img.img.loaded
            return

        char_w = 100
        char_h = 20

        ###
        # XXX: kill kitamuraj for this.
        # XXX: also need offset map
        ###

        ###
        if img=="goldy"
            char_h = 100
        if img=="suncrawler"
            char_h = 76
        if img=="bloodeye"
            char_h = 57
        ###

        #this.img = new Sprite("char", this.img_name, -500, -500, char_w, char_h);
        #this.img._sprite_x_off = 0;
        #this.img._sprite = 0;
        
        pos = @where()
        
        window.fg.image(@img.img, pos.x + @off_x, pos.y - char_h + @off_y)
        if ! (@_cycle_id or @img._cycle_id)
            @taint = false
