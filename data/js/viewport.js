var ViewPort = function(map, col, row, w, h) {

    var vp = this;
    vp.row = row;
    vp.col = col;

    vp.x = 0;
    vp.y = 0;

    vp.w = w;
    vp.h = h;

    vp.map = map;

    vp.hexes = [];
    vp.hidden = false;

    var key = F("{0}x{1}", [vp.col, vp.row]);
    map.vpc.around[key] = vp;
    vp.key = key;

    vp.at_off = function(off_x, off_y) {
        var key = F("{0}x{1}", [vp.col+off_x, vp.row+off_y]);

        if(key in vp.map.vpc.around)
            return vp.map.vpc.around[key];

        var new_vp = new ViewPort(vp.map,
                vp.col + off_x, vp.row + off_y,
                vp.w, vp.h
        );

        new_vp.x = vp.x + (off_x * HEX_W);
        new_vp.y = vp.y + (off_y * HEX_H);


        return new_vp;
    }

    vp.right = function() {
        return vp.at_off(vp.w, 0);
    }

    vp.bottom = function() {
        return vp.at_off(0, vp.h);
    }

    vp.draw = function(_id) {
        if(vp._drawed == true)
            return vp.show(_id);

        console.log(F("draw vp.col={0}, x={1}, vp.row={2}, y={3}", [vp.col, vp.x, vp.row, vp.y]));

        var col, row;
        vp._cache = vp.map.vpc.get_vp(vp.col, vp.row);
        vp.tiles = vp._cache.vp;

        for(col=vp.col; col<(vp.col+vp.w) ;col+=2) {
            if(vp.map.cells[col] === undefined)
                vp.map.cells[col] = [];

            for(row=vp.row; row<(vp.row+vp.h); row+=2) {
                vp.draw_hex(col, row);
            }
        }

        vp._drawed = true;
    }

    vp.draw_hex = function(col, row) {

        if((col % 4) != 0) {
            row++;
        }
        var _col = col - vp.col,
            _row = row - vp.row;

        var x = _col * HEX_W;
        var y = _row * HEX_H;

        var hex = new Hex(x + vp.x, y + vp.y, HEX_W, HEX_H);
        var tile_info = vp.tiles[_col >> 1][_row >> 1],
            tile_typ, tile_frame=0;

        if(typeof(tile_info) == 'string') {
            hex.back_img_name = tile_info;
        } else {
            hex.back_img_name = tile_info[0];
            hex.frame = tile_info[1];
        }

        hex.row = row;
        hex.col = col;
        hex.map = vp.map;
        hex.vp = vp;

        vp.map.cells[col][row] = hex;

        vp.hexes.push(hex);

        hex.draw();
        hex.free();

        hex.back_img.node.onclick = function(e) {
            console.log(F("hex: {0}x{1} in vp{2}=vp{3}",
                    [hex.col, hex.row, hex.vp.id, vp.id]));
            vp.click_hex(hex, e.button);
            __vp = vp;
        }

    }

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

    return vp;
}
