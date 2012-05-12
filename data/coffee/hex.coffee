class Hex 
    constructor: (@x, @y, w, h) ->
        @used = false;
        @frame = 0;
        @taint = true
    
    set_image: (@back_img_name) ->
        if @back_img_name == null
            @back_img_name = "grass"
            @gray = true
        else
            @gray = false

        img = "/img/tile/#{ @back_img_name }_0.png"
        @back_img = window.map.loadImage(img)
        @taint = true

    use: (whom) ->

        if whom.hex
           alert("CRAP!!!!!!!");
           return

        @used = whom;

        if (whom != undefined) && (whom.img != undefined)
           @img = whom.img;

        whom.hex = this
        if whom.draw
            @taint = 2

    free: ->
        if @used
            @used.hex = false;

        @used = false
        @img = false
        @taint = true

    draw: () ->
        if ! @back_img.loaded
            @taint = true
            return

        if @gray
            @back_img.filter(window.map.GRAY)

        window.map.image(@back_img, @x + @vp.x, @y + @vp.y - HEX_H)

        @taint = false

    where: ->
        return {
            x: @x + @vp.x,
            y: @y + @vp.y - HEX_H,
        }
