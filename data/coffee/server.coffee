class Server

    constructor: (@cb) ->
        path = window.location.toString();
        start = path.indexOf(":")
        end = path.indexOf("/", start+3);

        @domain = path.substr(start+3, end-start-3);
        @queue = [];

        @s = null

        console.log(@domain);

    connect: ->
        if @s
            console.log("already connected. wtf?");
            return;

        @s = new WebSocket("ws://#{@domain}/events")
        @s.onmessage = @onmessage;
        @s.onopen = @onopen;


    onopen: =>
        while (@queue.length && @s && @s.readyState == WebSocket.OPEN)
            @push(@queue.pop())


    onmessage: (evt) =>
        data = JSON.parse(evt.data);

        if(@cb)
            @cb(data);

    push: (data) ->
        if @s && @s.readyState == WebSocket.OPEN
            return @s.send(JSON.stringify(data));

        @queue.push(data);
