class EnterControl
    constructor: (@cb) ->
        @charlist = [];

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
            <% for char in @charlist: %>
            <p>
                <img src="/img/char/<%= char %>_0.png" 
                     typ="<%= char %>"
                />
            </p>
            <% end %>
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

        @cb(typ);

        @dialog.remove();
