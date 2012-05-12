class ViewPort
    constructor: (@map, @col, @row, @w, @h) ->

        @hexes = []
        @hidden = false
        @x = 0
        @y = 0

        key = "#{@col}x#{@row}"

        @map.vpc.around[key] = this
        @key = key

    at_off: (off_x, off_y) ->
        _col_off = @col+off_x
        _row_off = @row+off_y

        key = "#{_col_off}x#{_row_off}"

        if @map.vpc.around[key]
            return @map.vpc.around[key];

        new_vp = new ViewPort(@map, _col_off, _row_off, @w, @h)

        new_vp.x = @x + (off_x * HEX_W);
        new_vp.y = @y + (off_y * HEX_H);

        # XXX: why not setting it back to vpc.around?

        return new_vp;

    right: ->
        return @at_off(@w, 0);

    bottom: ->
        return @at_off(0, @h);

    draw: (_id) ->
        if @_drawed == true
            return @show(_id);

        console.log("draw vp #{@col} #{@w} #{@row} #{@h}")

        @_cache = @map.vpc.get_vp(@col, @row);
        if @_cache
            @tiles = @_cache.vp;

        col = @col
        while col<(@col+@w)
            if !@map.cells[col]
                @map.cells[col] = [];

            row = @row
            while row<(@row+@h)
                @draw_hex(col, row);
                row += 2

            col += 2

        @_drawed = true;

    draw_hex: (col, row) ->

        if (col % 4) != 0
            row++;

        _col = col - @col
        _row = row - @row

        x = _col * HEX_W;
        y = _row * HEX_H;

        hex = new Hex(x, y, HEX_W, HEX_H);
        hex.vp = this
        hex.map = @map;

        if @tiles
            tile_info = @tiles[_col >> 1][_row >> 1]
            if typeof(tile_info) == 'string'
                tile_typ = tile_info
            else
                tile_typ = tile_info[0]

            hex.set_image(tile_info)
        else
            hex.set_image(null)

        hex.row = row;
        hex.col = col;

        @map.cells[col][row] = hex;

        @hexes.push(hex);

    fetch: ->
        @map.vpc.prefetch(@col, @row, @tiles_reset)

    tiles_reset: =>
        @_cache = @map.vpc.get_vp(@col, @row);
        if @_cache
            @tiles = @_cache.vp;

        console.log("reset #{@col}x#{@row}")

        for hex in @hexes
               
            _col = hex.col - @col
            _row = hex.row - @row
     
            tile_info = @tiles[_col >> 1][_row >> 1]
            if typeof(tile_info) == 'string'
                tile_typ = tile_info
            else
                tile_typ = tile_info[0]

            hex.set_image(tile_typ)

        ###
        hex.draw();
        hex.free();

        hex.back_img.node.onclick = (e) ->
            console.log(F("hex: {0}x{1} in vp{2}=vp{3}",
                    [hex.col, hex.row, hex.vp.id, vp.id]));
            vp.click_hex(hex, e.button);
            __vp = vp;
        ###


    ###
    vp.click_hex = function(hex, button) {

        if(vp.map.changer === undefined) {
            vp.map.changer = MapChanger();
            vp.map.changer.show();
            return;
        }

        if(!vp.map.changer._shown)
            return vp.map.changer.show();

        vp.map.changer.set_vp(vp);

        if(!vp.map.changer.current) {
            alert("select tile");
            return;
        }

        vp.taint = true;

        hex.back_img.name = vp.map.changer.current;
        hex.back_img._dir = vp.map.changer.current_frame;
        hex.back_img.sprite("base");

        if(button!=0) {
            vp.foreach(function(hex) {
                hex.back_img.name = vp.map.changer.current;
                hex.back_img.sprite("base");
            })
        }


    }
    ###
    
    hide: ->
        @hidden = true

    show: ->
        @hidden = false

    move: (dir, skip_new) ->
        off_x=0
        off_y=0

        if dir==-1
            off_x = @w
        else if dir==1
            off_x = -@w
        else if dir==-@map.width
            off_y = @h;
        else if dir==@map.width
            off_y = -@h;

        # replace
        if skip_new
            new_vp = null
        else
            new_vp = @at_off(-off_x, -off_y);

            new_vp.x = @x;
            new_vp.y = @y;
            new_vp.id = @id;


        @id -= dir;
        @x += off_x * HEX_W;
        @y += off_y * HEX_H;

        return new_vp;
