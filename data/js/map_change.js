var MapChanger = function() {
    var mc = this;
    mc._shown = false;

    mc.tiles = [];

    mc.show = function() {
        if(mc._shown==true)
            return;

        mc.container = $("<div>");

        $("body").append(mc.container);

        jQuery.getJSON("/api/info/tile.list", mc._fetched)
    };

    mc.put_vp = function() {
        if(!mc.current_vp) {
            alert("change something");
            return;
        }

        console.log(F("put vp{0} to server", [mc.current_vp.id]));

        var vp_data = mc.current_vp.get_tiles();

        var opt = {
            "vp": vp_data,
            "col":  mc.current_vp.col,
            "row":  mc.current_vp.row,
        };

        jQuery.ajax({
            type: "POST",
            url: "/api/map/vp.change", 
            data: {data: JSON.stringify(opt)},
        });
    };

    mc._fetched = function(data) {
        mc.tiles = data.tiles;

        mc.add_tiles();
        mc.add_btn();
    }

    mc.add_btn = function() {

        var save = $("<input>");
        save.val("Save");
        save.attr("type", "button");

        mc.container.append(save);

        save.click(mc.put_vp);

    };

    mc.add_tile = function(tile_typ) {
       var tile = $("<p>"),
            img = $("<img>"),
            name = $("<span>");

        img.attr("src", F("/img/tile/{0}_0.png",
                    [tile_typ]));

        tile.append(img);

        name.text(tile_typ);
        tile.append(name);

        mc.container.append(tile);

        img.click(function() {
            mc.current = tile_typ;
        })

    };

    mc.add_tiles = function() {
        for(i=0; i< mc.tiles.length; i++ ) {
            mc.add_tile(mc.tiles[i]);
        }
    };

    return mc;
};
