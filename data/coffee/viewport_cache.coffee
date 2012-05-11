class VPCache
    constructor: () ->
        @cache = {}
        @around = {}

    _fetched: (data) ->
        key = "#{data.col}x#{data.row}"

        @cache[key] = data;

    prefetch: (col, row, cb) ->
        key = "#{col}x#{row}"

        if @cache[key]
            return;

        @cache[key] = undefined;
        opt =
            col: col
            row: row

        jQuery.getJSON("/api/map/vp", opt, (data) =>

            @_fetched(data);
            if cb
               cb()
        )

    get_vp: (col, row) ->
        key = "#{col}x#{row}"
        return @cache[key]
