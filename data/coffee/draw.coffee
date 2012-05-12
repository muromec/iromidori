HEX_W = 24;
HEX_W_FULL = 72;
HEX_H = 24;

window.draw_map = (el) ->

    canvas_pos = $("canvas").position()
    $(document).mousemove( (e) ->
      window.mouseX = e.pageX - canvas_pos.left
      window.mouseY = e.pageY - canvas_pos.top

    )
    
    rows = 24
    cols = 32

    map = new MMap rows, cols
    map.vpc = new VPCache

    window.fg = new Processing("chars", map.draw_fg)
    window.map = new Processing("map", map.draw_map)

    console.log("vps: #{ map.width }x#{ map.height}")

    map.setup_vp(0, 0)

    move = (ox, oy) ->
        server.push({"ox": ox, "oy": oy, "url": "/move"})

    
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
    key("c", () -> map.recenter(0));

    key('f', () ->
        hex = map.current_hex()
        server.push(
            url: "/fire"
            point: [hex.col, hex.row]
        )
    )

    server_cb = (data) ->
        console.log("got "+data.fn)
        map[data.fn](data.data)

    server = new Server(server_cb)

    enter_now = (char_typ, name) ->
        server.connect()
        server.push(
            url: "/enter"
            char_type: char_typ
            char_name: name
        )


    enter = new EnterControl(enter_now)
