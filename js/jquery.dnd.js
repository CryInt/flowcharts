$.fn.Drags = function(opts) {
    var ps = $.extend({
        opacity: .7,
        handler: null,
        onMove: function() { },
        onDrop: function() { },
        frame_id: "",
        max_left: 0,
        max_top: 0,
        in_grid: false
    }, opts);

    var dragndrop = {
        drag: function(e) {
            var dragData = e.data.dragData;

            var new_left = dragData.left + e.pageX - dragData.offLeft;
            var new_top  = dragData.top + e.pageY - dragData.offTop;

            if (ps.max_left == 0)
                ps.max_left = $(ps.frame_id).getCss("width");

            if (ps.max_top == 0)
                ps.max_top = $(ps.frame_id).getCss("height");

            if (new_left <= 0)
                new_left =  0;

            if (new_left >= (ps.max_left - dragData.width - 2))
                new_left =  (ps.max_left - dragData.width - 2);

            if (new_top <= 0)
                new_top =  0;

            if (new_top >= (ps.max_top - dragData.height - 2))
                new_top =  (ps.max_top - dragData.height - 2);

            if (ps.in_grid) {
                new_top  = Math.ceil(Math.ceil(new_top  / 10) * 10);
                new_left = Math.ceil(Math.ceil(new_left / 10) * 10);
            }

            dragData.target.css({
                left: new_left,
                top:  new_top
            });
            dragData.handler.css({ cursor: 'move' });
			dragData.target.css ({ cursor: 'move' });
            dragData.onMove(e);
        },
        drop: function(e) {
            var dragData = e.data.dragData;
            dragData.target.css(dragData.oldCss);
            dragData.handler.css('cursor', dragData.oldCss.cursor);
            dragData.onDrop(e);
            $("body").off('mousemove', dragndrop.drag)
                     .off('mouseup',   dragndrop.drop);
        }
    }

    return this.each(function() {
        var me = this;
        var handler = null;
        
        if (typeof ps.handler == 'undefined' || ps.handler == null)
            handler = $(me);
        else
            handler = (typeof ps.handler == 'string' ? $(ps.handler, this) : ps.handler);

        handler.on('mousedown', { e: me }, function(s) {
            var target = $(s.data.e);
            var oldCss = {};
            if (target.css('position') != 'absolute') {
                try {
                    target.position(oldCss);
                } catch (ex) { }
                target.css('position', 'absolute');
            }
			oldCss.cursor = 'move';
            oldCss.opacity = target.getCss('opacity') || 1;
            var dragData = {
                left: oldCss.left || target.getCss('left') || 0,
                top: oldCss.top || target.getCss('top') || 0,
                width: target.width() || target.getCss('width'),
                height: target.height() || target.getCss('height'),
                offLeft: s.pageX,
                offTop: s.pageY,
                oldCss: oldCss,
                onMove: ps.onMove,
                onDrop: ps.onDrop,
                handler: handler,
                target: target
                }
            target.css('opacity', ps.opacity);
			target.css('cursor', 'move');
            $("body").on('mousemove', { dragData: dragData }, dragndrop.drag)
                     .on('mouseup',   { dragData: dragData }, dragndrop.drop);
        });
    });
}