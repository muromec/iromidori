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
    vp.tiles = [
        "magma",
        "grass",
        "stone_h",
        "water_e",
    ];

    vp.at_off = function(off_x, off_y) {
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

    vp.draw = function() {
        var col, row;

        console.log(F("draw vp.col={0}, w={1}, vp.row={2}, h={3}", [vp.col, vp.w, vp.row, vp.h]));

        for(col=vp.col; col<(vp.col+vp.w) ;col+=2) {
            if(vp.map.cells[col] === undefined)
                vp.map.cells[col] = [];

            for(row=vp.row; row<(vp.row+vp.h); row+=2) {
                vp.draw_hex(col, row);
            }
        }
    }

    vp.draw_hex = function(col, row) {

        if((col % 4) != 0) {
            row++;
        }

        var x = (col - vp.col) * HEX_W;
        var y = (row - vp.row) * HEX_H;

        var hex = new Hex(x + vp.x, y + vp.y, HEX_W, HEX_H);

        hex.back_img_name = vp.tiles[ViewPort._tile];
        hex.row = row;
        hex.col = col;
        hex.map = vp.map;
        hex.vp = vp;

        vp.map.cells[col][row] = hex;

        vp.hexes.push(hex);

        hex.draw();
        hex.free();

        hex.back_img.node.onclick = function() {
            vp.click_hex(hex);
        }

    }

    vp.click_hex = function(hex) {

        if(vp.map.changer === undefined) {
            vp.map.changer = MapChanger();
            vp.map.changer.show();
            return;
        }

        if(!vp.map.changer.current) {
            alert("select tile");
            return;
        }

        hex.back_img.name = vp.map.changer.current;
        hex.back_img.sprite("base");

    }

    vp.hide = function() {
        for(var id=0; id<vp.hexes.length; id++) {
            var hex=vp.hexes[id];

            hex.hide();
        }
    }

    vp.move = function(dir) {
        var off_x=0, off_y=0;

        if(dir==-1)
            off_x = vp.w;
        if(dir==1)
            off_x = -vp.w;
        if(dir==-2)
            off_y = vp.h;
        if(dir==2)
            off_y = -vp.h;

        for(var id=0; id<vp.hexes.length; id++) {
            var hex=vp.hexes[id];

            hex.move(off_x * HEX_W, off_y * HEX_H);
        }

        ViewPort._tile ++;

        if(ViewPort._tile >= vp.tiles.length) ViewPort._tile=0;


        console.log(F("replace vp {0}/{1} {2}/{3}", [
                    vp.col - off_x, off_x,
                    vp.row - off_y, off_y]));
        // replace
        var new_vp = new ViewPort(vp.map,
                vp.col - off_x, vp.row - off_y,
                vp.w, vp.h
        );
        new_vp.x = vp.x;
        new_vp.y = vp.y;
        new_vp.id = vp.id;

        vp.id -= dir;
        vp.x += off_x * HEX_W;
        vp.y += off_y * HEX_H;

        return new_vp;
    }

    return vp;
}

ViewPort._tile = 0;
