var Hex = function(x, y, w, h) {
    var f1 = w / 7 * 6,
        f2 = w / 7 * 8;

    var hex = this;

    hex.used = false;
    hex.x = x;
    hex.y = y;

    hex.use = function (whom) {
       hex.used = whom;

       if(whom != undefined && whom.img != undefined)
           hex.img = whom.img;

    };

    hex.free = function() {
       hex.used = false;
       hex.img = false;

    };

    hex.draw = function() {

       hex.back_img = new Sprite("tile", hex.back_img_name,
               hex.x, hex.y - HEX_H,
               HEX_W_FULL, HEX_H*2
       );
       hex.back_img.toBack();

    };

    hex.move = function(off_x, off_y) {
        hex.back_img.translate(off_x, off_y);

        if(!hex.img)
            return;

        hex.img.translate(off_x, off_y);

    };

    hex.hide = function() { hex.back_img.hide(); }
    hex.show = function() { hex.back_img.show(); }

    return hex;

};
