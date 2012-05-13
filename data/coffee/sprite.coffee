EMPTY_PNG = "/img/empty.png";

class Sprite
    constructor: (@cls, @name, dir) ->
        @state = "base";
        @_dir = dir || 0;
        @frames =
            "go": 1,
            "fire": 3,

        @_cycles = 0;
        @frame = 0;
        @load()
        @sprites_dir = [{},{}]
        @sprites = {}
        @sprite("base");

    load: ->
        @_full = window.fg.loadImage("/img/#{@cls}/#{@name}_sprite.png")
        if @_full.loaded
            @split()

    split: ->
        if ! @_full.loaded
            return

        sprite_map = [
            "base0",
            "go0",
            "go1",
            "fire0",
            "fire1",
            "fire2",
            "fire3",
        ]

        y = 0
        for sprite in sprite_map
            img = window.fg.createImage(100, 40, 2)
            console.log("copy #{y} #{sprite}" + @_full.loaded)
            img.copy(@_full, 0, y, 100, 40,
                             0, 0, 100, 40
            )
            @sprites_dir[0][sprite] = img

            img = window.fg.createImage(100, 40, 2)
            img.copy(@_full, 100, y, 100, 40,
                             0, 0, 100, 40
            )
            @sprites_dir[1][sprite] = img

            y += 40

        @sprites = @sprites_dir[@_dir]


    sprite_cycle: (state, ms, stop) ->

        if @_cycles > 0
            return;

        @_cycles += 1

        @frame = 0
        @sprite(state, @frame);

    
        cycle_tick = =>
            @frame+=1
            if @frame > @frames[state]
                @frame = 0;

            @sprite(state, @frame);

            if stop && !@frame
                @sprite_cycle_stop();

        @_cycle_id = window.setInterval(cycle_tick, ms)

    sprite_cycle_stop: ->
        @_cycles = 0

        clearInterval(@_cycle_id);

        @sprite("base");
        @_cycle_id = null


    sprite: (state, frame) ->
        @state = state
        if frame == undefined
            frame = 0

        @img = @sprites[@state+frame]

    get_frame: ->
        if @img
            return @img

        if ! @sprites.base_0_0 and @_full.loaded
            @split()

        @img = @sprites[@state+@frame]
        return @img

    dir: (dir) ->
        @_dir = dir
        @sprites = @sprites_dir[dir]
