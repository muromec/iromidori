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

        hex = new Hex(x + @x, y + @y, HEX_W, HEX_H);

        ###
        var tile_info = vp.tiles[_col >> 1][_row >> 1],
            tile_typ, tile_frame=0;

        if(typeof(tile_info) == 'string') {
            hex.back_img_name = tile_info;
        } else {
            hex.back_img_name = tile_info[0];
            hex.frame = tile_info[1];
        }
        ###
        hex.set_image('grass')

        hex.row = row;
        hex.col = col;
        hex.map = @map;
        hex.vp = this

        @map.cells[col][row] = hex;

        @hexes.push(hex);

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

    vp.hide = function() {
        for(var id=0; id<vp.hexes.length; id++) {
            var hex=vp.hexes[id];

            hex.hide();
        }
        vp._id = vp.id;
        vp.hidden = true;
    }

    vp.show = function(_id) {
        for(var id=0; id<vp.hexes.length; id++) {
            var hex=vp.hexes[id];

            hex.show();

        }
        vp.hidden = false;
    }

    vp.foreach = function(f) {
        for(var id=0; id<vp.hexes.length; id++) {
            f(vp.hexes[id])
        }
    }

    vp.move = function(dir, skip_new) {
        var off_x=0, off_y=0;
        console.log(F("move {0} dir {1} ", [vp.key, dir]));

        if(dir==-1)
            off_x = vp.w;
        if(dir==1)
            off_x = -vp.w;
        if(dir==-vp.map.width)
            off_y = vp.h;
        if(dir==vp.map.width)
            off_y = -vp.h;

        for(var id=0; id<vp.hexes.length; id++) {
            var hex=vp.hexes[id];

            hex.move(off_x * HEX_W, off_y * HEX_H);
        }

        // replace
        if(!skip_new) {
            var new_vp = vp.at_off(-off_x, -off_y);

            new_vp.x = vp.x;
            new_vp.y = vp.y;
            new_vp.id = vp.id;
        }


        vp.id -= dir;
        vp.x += off_x * HEX_W;
        vp.y += off_y * HEX_H;



        return new_vp;
    }

    vp.prefetch_around = function() {
        var vpc = vp.map.vpc;

        vpc.prefetch(vp.col+vp.w, vp.row+vp.h);
        vpc.prefetch(vp.col+vp.w, vp.row-vp.h);
        vpc.prefetch(vp.col-vp.w, vp.row+vp.h);
        vpc.prefetch(vp.col-vp.w, vp.row-vp.h);

        vpc.prefetch(0, vp.row+vp.h);
        vpc.prefetch(0, vp.row-vp.h);
        vpc.prefetch(vp.col+vp.w, 0);
        vpc.prefetch(vp.col-vp.w, 0);
    }

    vp.get_tiles = function() {
        var ret = [],
            col = [];

        vp.foreach(function(hex) {

            col.push(hex.back_img.name);

            if(col.length == vp.h/2) {
                ret.push(col);
                col = [];
            }

        })

        return ret;
    };

    ###
