class User
    constructor: (@uid, @x, @y, @img_name) ->
        @hidden = true
        img = "/img/char/#{ @img_name }_0.png"
        @img = new Sprite("char", @img_name, 0)

    fire: ->
        @img.sprite_cycle("fire", 300, true);

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

    move: (new_x, new_y, vp) ->

        #sprite_x_off = @img._sprite_x_off;

        if (@x - new_x) < 0
            sprite_x_off = -30;
            @img.dir(1);

        else if (@x - new_x) > 0
            sprite_x_off = 0;
            @img.dir(0);

        @img.sprite_cycle("go", 150, true);

        #var old_where = this.where(vp);

        @x = new_x;
        @y = new_y;

        #var where = this.where(vp);


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
        
        window.ps.image(@img.img, pos.x, pos.y - char_h)

        console.log("draw user")
        return ! @img._cycle_id
