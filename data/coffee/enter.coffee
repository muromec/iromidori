class EnterControl
    $join: $(".join")
    $name: $("input.char_name")

    constructor: (@cb) ->
        @charlist = [];
        @$join.on("click", @on_join)

    on_join: (evt) =>
        @fetch()
        @$join.hide()

        return false

    _fetched: (data) =>
        @charlist = data.chars;
        console.log(data)
        console.log(this)
        @show()

    fetch: ->
        jQuery.getJSON("/api/info/char.list", @_fetched)

    show: ->
        source = """
        <div class="char_list">
            <div class="char_list_in">
            <input class="char_name" placeholder="Username" />
            <% for char in @charlist: %>
            <p>
                <img src="/img/char/<%= char %>_0.png" 
                     typ="<%= char %>"
                />
            </p>
            <% end %>
            </div>
        </div>
        """

        html = eco.render(source, { "charlist": @charlist })

        @dialog = $(html)

        $("body").append(@dialog)

        _selected = @selected
        $(".char_list img").on("click", ->
            typ = $(this).attr("typ")
            _selected(typ)
        )

    selected: (typ) =>
        $name = $("input.char_name")

        name = $name.val()
        if (name.length < 1)
            alert("Enter username")
            return

        @cb(typ, name)

        @dialog.remove();
