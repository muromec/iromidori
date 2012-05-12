ani = []

class FAnimation
    constructor: ->
        @workzone = $("<canvas>")
        @workzone.css("position", "absolute")
        @workzone.css("z-index", 100)

        $("body").append(@workzone)

        new Processing(@workzone.get(0), @ps_init)
        @frame = 0

        ani.push(this)

    ps_init: (ps) =>
        @ps = ps
        ps.setup = @setup
        ps.draw = @draw

    setup: =>
        @ps.size($(window).width(), $(window).height())
        @ps.background(0, 0.5)

    draw: =>
        @frame += 1

        if @frame > 30
            @remove()
            return

    remove: ->
        @ps.exit()
        ani_idx = ani.indexOf(this)
        ani.splice(ani_idx, 1)

        @workzone.remove()

class Lighting extends FAnimation

    constructor: (@li_frm, @li_to, @user) -> super()

    draw: =>

        super()

        off_x = Math.floor(Math.random()*9)
        off_y = Math.floor(Math.random()*15)
        off_x_2 = Math.floor(Math.random()*HEX_W_FULL)
        off_y_2 = Math.floor(Math.random()*HEX_H)

        if @user
            pos = @user.where()
        else
            pos = @li_frm

        if @user and  @user.img._dir
            off_x += HEX_W_FULL

        off_y -= HEX_H / 2

        @ps.stroke(Math.random()*256)
        @ps.strokeWeight(Math.floor(Math.random()*10)/3)

        @ps.line(pos.x + off_x, pos.y+ off_y,
            @li_to.x + off_x_2, @li_to.y + off_y_2)
