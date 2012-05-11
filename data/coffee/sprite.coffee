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
        @sprite("base");

    path: (state) ->

        if state == "base"
            sprite = "";
        else
            sprite = "_" + state + @frame;

            @frame+=1
            if @frame > @frames[state]
                @frame = 0;

        return "/img/#{@cls}/#{@name}_#{@_dir}#{sprite}.png"


    sprite_cycle: (state, ms, stop) ->
        @_cycles += 1

        if @_cycles > 1
            return;

        @sprite(state);

        cycle_tick = =>
            @sprite(state);

            if stop && !@frame
                @sprite_cycle_stop();

        @_cycle_id = window.setInterval(cycle_tick, ms)

    sprite_cycle_stop: ->
        @_cycles -= 1

        if @_cycles > 0
            return;

        clearInterval(@_cycle_id);

        @sprite("base");
        @_cycle_id = null


    sprite: (state) ->
        @img = window.ps.loadImage(@path(state))

    dir: (dir) ->
        @_dir = dir
