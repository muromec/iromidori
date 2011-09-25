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

        hex.back_img_name = 'magma';
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

    return vp;
}
