var User = function(uid, x, y, img) {
    this.x = x;
    this.y = y;
    this.uid = uid;
    this.img_name = img;

    var user = this;

    this.fire = function() {

        user.img.sprite_cycle("fire", 300, true);

    };

    this.hide = function() {
        this.hidden = true;

        user.x = undefined;
        user.y = undefined;

        user.img.hide();
    };

    this.where = function(vp) {
        var x, y;

        x = (this.x - vp.col) * HEX_W;
        y = (this.y - vp.row) * HEX_H;

        return {
            x: x + user.img._sprite_x_off + vp.x,
            y: y + vp.y,
        }
    };

    this.show = function(new_x, new_y, vp) {
        console.log("show");
        this.hidden = false;

        user.x = new_x;
        user.y = new_y;

        user.img.attr( this.where(vp) );

        user.img.show();

    };

    this.move = function(new_x, new_y, vp) {

        var sprite_x_off = user.img._sprite_x_off;

        if((user.x - new_x) < 0) {
            sprite_x_off = -30;
            user.img.dir(1);

        } else if ((user.x - new_x) > 0) {
            sprite_x_off = 0;
            user.img.dir(0);
        }


        user.img.sprite_cycle("go", 150);

        var old_where = this.where(vp);

        user.x = new_x;
        user.y = new_y;

        var where = this.where(vp);

        user.img.animateAlong(F("M{0},{1}L{2},{3}",[

                old_where.x, old_where.y,
                where.x, where.y,
                ]), 
                800,
                false,
                function() {
                    user.img.sprite_cycle_stop();
                }
        );

        user.img._sprite_x_off = sprite_x_off;

        user.img.toFront();

        
    };

    this.draw = function() {
        var char_w = 100,
            char_h = 40;

        /*
         * XXX: kill kitamuraj for this.
         * XXX: also need offset map
         * */
        if(img=="goldy")
            char_h = 100;
        if(img=="suncrawler")
            char_h = 76;
        if(img=="bloodeye")
            char_h = 57;

        this.img = new Sprite("char", this.img_name, -500, -500, char_w, char_h);
        this.img._sprite_x_off = 0;
        this.img._sprite = 0;

        this.img.wtf = 'char';

    }

    return this;
};
