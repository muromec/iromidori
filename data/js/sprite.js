var Sprite = function(cls, name, x, y, w, h) {
    var ob = this;

    ob.cls = cls;
    ob.state = "base";
    ob.name = name;
    ob.dir = 0;
    ob.frames = {
        "go": 1,
        "fire": 3,
    }

    var path = function(state) {
        var sprite;
        if (state == "base") {
            sprite = "";
        } else {
            sprite = "_" + state + image.frame;

            image.frame++;
            if(image.frame > ob.frames[state])
                image.frame = 0;
        }

        return F(
            "/img/{0}/{1}_{2}{3}.png",
            [ 
                ob.cls,
                ob.name,
                ob.dir,
                sprite
            ]
        )


    }

    image = paper.image(path("base", 0), x, y, w, h);

    image.sprite = function(state, frame) {
        image.attr("src", path(state, frame));
    }

    image.dir = function(dir) {
        ob.dir = dir;
    }

    image.frame = 0;
    return image;
}
