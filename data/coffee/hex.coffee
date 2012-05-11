class Hex 
    constructor: (@x, @y, w, h) ->
        @used = false;
        @frame = 0;
        @taint = true
    
    set_image: (@back_img_name) ->
        img = "/img/tile/#{ @back_img_name }_0.png"
        @back_img = window.ps.loadImage(img)
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
            return

        window.ps.image(@back_img, @x, @y - HEX_H)

        if @used && @used.draw
            ret = @used.draw()
            if ! ret
                return

            if @taint > 1
                @taint -= 1
                return

        @taint = false
