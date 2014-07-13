$.extend($.fn, {
    getCss: function(key) {
        var v = parseInt(this.css(key));
            if (isNaN(v))
                return false;
            return v;
        }
});

