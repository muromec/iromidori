var EnterControl = function(cb) {
    var ec = this;
    ec.charlist = [];

    ec.cb = cb;

    ec._fetched = function(data) {
        ec.charlist = data.chars;
        ec.show();
    }

    ec.fetch = function() {
        jQuery.getJSON("/api/info/char.list", ec._fetched)
    };

    ec.show = function() {
        ec.dialog = $("<div>");
        ec.dialog.addClass("char_list");

        for(var i=0; i<ec.charlist.length; i++) {
            var chr = $("<p>");
            var name = ec.charlist[i];

            chr.text(name);

            ec.dialog.append(chr);

            var img = $("<img>");
            img.attr("src", F("/img/char/{0}_0.png", [name]));

            chr.append(img);
            chr.data({"type": name});

            chr.click(this.selected);
        }

        $("body").append(ec.dialog);
    };

    ec.selected = function() {
        var char_data = $(this).data();

        ec.cb(char_data);

        ec.dialog.remove();

    };

    return ec;

};
