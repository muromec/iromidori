
var Hex = function(paper, x, y) {
    var hex = paper.path(Raphael.format("M{0} {1}l30 25l40 0l30 -25l-30 -25l-40 0z", [x, y]));
    hex.attr("fill", "#fff");

    hex.node.onclick = function() {

        if(hex.sel) {
            hex.sel = false;
            hex.attr("fill", 'green');

            hex.text.show();

        } else {
            hex.sel = true;
            hex.attr("fill", 'red');

            hex.text.hide();
        }
    }

    return hex;

};

var Map = function(rows, cols) {
    this.cells = [];

    for(col=0;col<cols;col++) {
        this.cells[col] = [];
    }

    return this;
};

var draw_map = function(el) {
    var paper = Raphael(el, 1100, 600);
    paper.hex = function(x, y) {
        return Hex(paper, x, y);
    }

    var row, rows = 20,
        col, cols = 30;

    var map = Map(rows, cols);

    for(row=0; row<rows; row+=2) {
        var y = (row * 25) + 40, _y = 0;
        var _row = 0;

        for(col=0; col<cols; col+=2) {

            if((col % 4)==0) {
                _y = 25;
                _row = row + 1;

            } else {
                _y = 0;
                _row = row;
            }

            var x = col * 35;

            var hex = paper.hex(x, y + _y);
            hex.text = paper.text(x + 25, y + _y , Raphael.format("{0}x{1}", [_row, col]));
            hex.col = col;
            hex.row = _row;

            map.cells[_row][col] = hex;
        }
    }
}
