class Hex 
    constructor: (@x, @y, w, h) ->
        @used = false;
        @frame = 0;
        @taint = true
    
    set_image: (@back_img_name) ->
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
        img = Hex.hl.get(@back_img_name)
        if ! img
            @taint = true
            return

        window.map.image(img, @x + @vp.x, @y + @vp.y - HEX_H)

        @taint = false
        return true

    ellips: ->
        window.map.fill(5, 0.5)
        window.map.ellipse(@x + @vp.x + HEX_W_FULL/2, @y + @vp.y,
            HEX_W_FULL, HEX_H*2)

    where: ->
        return {
            x: @x + @vp.x + (HEX_W_FULL/2),
            y: @y + @vp.y,
        }

class HexLib
    constructor: ->
        @loaded = {}

    get: (name) ->
        fname = name
        if name == null
            fname = "grass"
            gray = true
        else
            gray = false

        img = @loaded[name]
        if not img
            fname = "/img/tile/#{fname}_0.png"
            img = window.map.loadImage(fname)
            @loaded[name] = img

        if not img.loaded
            return null

        if gray and not img.gray
            img.filter(window.map.GRAY)
            img.gray = true

        return img

Hex.hl = new HexLib()
