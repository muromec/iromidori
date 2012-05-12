class Stat
    constructor: (@user, @element_id) ->
        @$element = $("##{@element_id}")
        @render()

    render: ->
        source = """
        <div class="char_name char_s"><%= @name %></div>
        <div class="char_hp char_s"><%= @stat.hp %></div>
        <% if @stat.dead: %>
        <div class="char_s char_dead">DEAD</div>
        <% end %>
        """

        console.log(@user)

        html = eco.render(source, @user)

        @$element.html(html)
        @$element.show()

        $(".char_name", @$element).on("click", @on_name)

    on_name: =>

        c = new Circle(@user, @user.where(), true)

        return false

    warning: ->
        @$element.addClass("warning")
