HEX_W = 24;
HEX_W_FULL = 72;
HEX_H = 24;

window.draw_map = (el) ->

    
    rows = 24
    cols = 32

    map = new MMap rows, cols
    map.vpc = new VPCache

    canvas = document.getElementById "map"
    processing = new Processing(canvas, map.draw)
    window.ps = processing

    console.log("vps: #{ map.width }x#{ map.height}")

    vp = new ViewPort map, 0, 0, cols/2, rows/2
    vp.id = 0;

    map.vp.push(vp)

    while map.vp.length < (map.width * map.height)

        if (vp.id % map.width) < (map.width-1)
            console.log("row+ "+vp.id);
            vp = vp.right();
        else
            console.log("next row "+vp.id);
            vp = map.vp[map.vp.length - map.width].bottom();

        vp.id = map.vp.length;
        map.vp.push(vp);

    draw_vp = (vp) ->
        map.vpc.prefetch(vp.col, vp.row, () ->
            vp.draw()
         #   vp.prefetch_around()
        )


    for vp in map.vp
        draw_vp(vp)

    move = (ox, oy) ->
        server.push({"ox": ox, "oy": oy, "url": "/move"})

    
    ###

    key('l', () -> move(2, 1));
    key('o', () -> move(2, -1));

    key('h', () -> move(-2, 1));
    key('y', () -> move(-2, -1));

    key('j', () -> move(0, 2));
    key('k', () -> move(0, -2));

    key("up", () -> map.recenter(-map.width));
    key("down", () -> map.recenter(map.width));
    key("left", () -> map.recenter(-1));
    key("right", () -> map.recenter(1));

    key('f', () ->
        server.push({"url": "/fire"})
    )

    server = new Server();
    server.cb = (data) ->
        console.log("got "+data.fn)
        map[data.fn](data.data)

    enter_now = (char_data) ->
        server.connect()
        server.push({"url": "/enter", "char_type": char_data.type})


    enter = new EnterControl(enter_now)
    enter.fetch()
    ###
