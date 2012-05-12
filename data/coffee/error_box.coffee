
class ErrBox
    constructor: (@msg) ->
        source = """
        <div class="err_box">
            <%= @msg %>

            <div class="ok_btn">
                <a href="#">hide</a>
            </div>
        </div>
        """

        html = eco.render(source, this)

        @el = $(html)

        $("body").append(@el)

        $(".ok_btn a", @el).on("click", @hide)

        ErrBox.retain.push(this)

        setTimeout(@hide, 1500)

    hide: =>

        console.log("hide err box")
        @el.remove()
        ErrBox.retain.splice(ErrBox.retain.indexOf(this), 1)

        return false

ErrBox.retain = []
