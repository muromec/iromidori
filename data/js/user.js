var User = function(uid, x, y, img) {
    this.x = x;
    this.y = y;
    this.uid = uid;

    this.img = img;

    var user = this;

    this.fire = function() {

        user.img.sprite_cycle("fire", 300, "base");

    };

    return this;
};
