var Hex = function(x, y, w, h) {
    var f1 = w / 7 * 6,
        f2 = w / 7 * 8;

    var hex = this;

    hex.used = false;
    hex.x = x;
    hex.y = y;

    hex.use = function (whom) {

       if(whom.hex)
           alert("CRAP!!!!!!!");

       hex.used = whom;

       if(whom != undefined && whom.img != undefined)
           hex.img = whom.img;

       whom.hex = hex;

    };

    hex.free = function() {
       hex.used.hex = false;
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
        hex._at_images(function(img) {
            img.translate(off_x, off_y);
        })

    };

    hex._at_images = function(f) {
        f(hex.back_img);
        if(hex.img)
            f(hex.img)
    }

    hex.images = function(f) {
        hex._at_images(function(img) {
            img[f]();
        })
    }

    hex.hide = function() { 
        hex._at_images(function(img) {
            img._vpx = img.attrs.x - hex.vp.x,
            img._vpy = img.attrs.y - hex.vp.y,

            img.hide();
        })

        if(!hex.used)
            return;

        hex.used.hide();
        hex.free();

    }
    hex.show = function() {
        hex._at_images(function(img) {
            img.attr({
                x: img._vpx + hex.vp.x,
                y: img._vpy + hex.vp.y,
            })
            img.show();
        })
    }

    return hex;

};
