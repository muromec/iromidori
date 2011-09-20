var Hex = function(paper, x, y, w, h) {
    var f1 = w / 7 * 6,
        f2 = w / 7 * 8;

    var hex = paper.path(
        Raphael.format(
            "M{0} {1}l{2} {4}l{3} 0l{2} -{4}l-{2} -{4}l-{3} 0z", [x, y, f1, f2, h]));

    hex.used = false;
    hex.attrs.x = x;
    hex.attrs.y = y;

    hex._hl = function(off_x, off_y, color) {
        var col = this.map.cells[hex.col+off_x];
        if(col===undefined)
            return;

        var _hex = col[hex.row+off_y];

        if(_hex === undefined)
            return;

        if(_hex.used)
            return;

        if(color===undefined)
            color=_hex._color;

        _hex._color = _hex.attrs.fill;

        _hex.attr("fill", color);

    };

    hex.halo = function(color) {
       hex._hl(0, +2, color);
       hex._hl(0, -2, color);
       hex._hl(2, +1, color);
       hex._hl(2, -1, color);
       hex._hl(-2, +1, color);
       hex._hl(-2, -1, color);

    };

    hex.use = function (whom) {
       //hex.attr("fill", 'red');
       hex.text.hide();

       hex.used = whom;

       if(whom != undefined && whom.img != undefined)
           hex.img = whom.img;

       /*
       if(whom!==true)
           hex.halo('yellow');
           */

    };

    hex.free = function() {
       hex.text.hide();
       hex.used = false;
       hex.img = false;

       //hex.halo();
       //
       __hex = hex;

    };

    hex.draw = function() {

       hex.back_img = new Sprite("tile", hex.back_img_name,
               hex.attrs.x, hex.attrs.y - HEX_H,
               HEX_W_FULL, HEX_H*2
       );
       hex.back_img.toBack();

    };

    hex.attr({stroke: 0x00000000});

    return hex;

};
