HEX_W = 24;
HEX_W_FULL = 72;
HEX_H = 24;

window.draw_map = (el) ->

    canvas_pos = $("canvas").position()
    $(document).mousemove( (e) ->
      window.mouseX = e.pageX - canvas_pos.left
      window.mouseY = e.pageY - canvas_pos.top

    )
    
    rows = 12
    cols = 16

    map = new MMap rows, cols
    map.vpc = new VPCache

    window.fg = new Processing("chars", map.draw_fg)
    window.map = new Processing("map", map.draw_map)

    console.log("vps: #{ map.width }x#{ map.height}")

    parse_loc = (inp) ->
        res = /.*#([-{0,1}0-9]+)x(-{0,1}[0-9]+)/.exec(inp)
        if res is null
            return [0,0]

        [_res, x, y] = res
        x = Number(x)
        y = Number(y)

        if x == NaN or y == NaN
            return [0,0]
        
        x = Math.round(x/cols) * cols
        y = Math.round(y/rows) * rows
        return [x,y]

    [x, y] = parse_loc(window.location.toString())
    console.log("setup at #{x} x #{y}")
    map.setup_vp(x, y)

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


    window.enter = new EnterControl(enter_now)
