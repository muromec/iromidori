var VPCache = function() {
    var vpc = this;
    vpc.cache=new Object();

    vpc._fetched = function(data) {
        var col = data.col,
            row = data.row;

        vpc.cache[F("{0}x{1}", [col, row])] = data;
    }
    vpc.prefetch = function(col, row, cb) {
        var opt = {
            col: col,
            row: row,
        }
        jQuery.getJSON("/api/map/vp", opt, function(data) {

            vpc._fetched(data);
            if(cb) cb()
        })
    }

    vpc.get_vp = function(col, row) {
        return vpc.cache[F("{0}x{1}", [col, row])];
    }

    return vpc;
}
