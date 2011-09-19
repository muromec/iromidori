M = (function() {
    var load = 0;
    var load_cb = null;

    var loaded = function(_load_cb) {
        load_cb = _load_cb;
    };

    var mod_loaded = function() {
        load--;

        if(load==0 && load_cb)
            load_cb();
    };

    var require = function(mod) {

        if(typeof(mod) == 'function')
            return loaded(mod);
            

        load ++;

        var path = "/js/"+mod+".js";
        var head= document.getElementsByTagName('head')[0];
        
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src = path;
        script.onreadystatechange= function () {

            if(this.readyState != 'complete')
                return;

            mod_loaded();

        }
        script.onload = mod_loaded;
        head.appendChild(script);
    }

    return {
        "require": require,
        "loaded": loaded,
    }
}())

_m = M.require;
