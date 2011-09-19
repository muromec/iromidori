var User = function(uid, x, y, img) {
    this.x = x;
    this.y = y;
    this.uid = uid;

    this.img = img;

    this.fire = function() {
        console.log('fire');
        this.firesprite = 0;
        var user = this;

        var animate_fire = function(_e) {
            console.log("animate fire "+user.firesprite);

            user.img.attr("src",
                    F(
                        "/img/char/{0}_{1}_fire{2}.png",
                        [
                            user.img._img,
                            user.img._sprite,
                            user.firesprite
                        ]
            ));

            user.firesprite++;

            if(user.firesprite > 3) {
                clearInterval(user._fire);
                user._fire = null;
                user.img.attr("src",
                    F(
                        "/img/char/{0}_{1}.png", [
                            user.img._img,
                            user.img._sprite
                        ]
                    )
                );
            }


        }

        if(!this._fire)
            this._fire = window.setInterval(animate_fire, 300);

    };

    return this;
};

