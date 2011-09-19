var User = function(uid, x, y, img) {
    this.x = x;
    this.y = y;
    this.uid = uid;

    this.img = img;

    this.fire = function() {
        var user = this;

        var animate_fire = function(_e) {
            user.img.sprite("fire");

            if(!user.img.frame) {
                clearInterval(user._fire);
                user._fire = null;

                user.img.sprite("base");
            }
        }

        if(!this._fire)
            this._fire = window.setInterval(animate_fire, 300);

    };

    return this;
};
