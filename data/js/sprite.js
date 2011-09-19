EMPTY_PNG = "/img/empty.png";

var Sprite = function(cls, name, x, y, w, h) {
    var image = paper.image(EMPTY_PNG, x, y, w, h);

    image.cls = cls;
    image.state = "base";
    image.name = name;
    image._dir = 0;
    image.frames = {
        "go": 1,
        "fire": 3,
    }

    image.path = function(state) {
        var sprite;
        if (state == "base") {
            sprite = "";
        } else {
            sprite = "_" + state + image.frame;

            image.frame++;
            if(image.frame > image.frames[state])
                image.frame = 0;
        }

        return F(
            "/img/{0}/{1}_{2}{3}.png",
            [ 
                image.cls,
                image.name,
                image._dir,
                sprite
            ]
        )


    }


    image.sprite = function(state, frame) {
        image.attr("src", image.path(state, frame));
    }

    image.dir = function(dir) {
        image._dir = dir;
    }

    image.frame = 0;
    image.sprite("base");

    return image;
}
