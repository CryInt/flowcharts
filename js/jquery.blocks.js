var blocks = {
	blocksObject: { 'blocks': {}, 'arrows': {} },
	last_block: "",
	frame_id: "",
	debug: false,
	is_editable: false,
	dblclick: "",
	max_left: 0,
	max_top: 0,
	in_grid: false,

	init: function(frame_id, is_editable) {
		if (typeof(is_editable) === 'undefined')
			is_editable = false;

		this.frame_id = frame_id;
		this.is_editable = is_editable;
		arrowsDrawer = $cArrows(frame_id, { render : { strokeStyle: '#000000' , lineWidth: 1 } });
	},

	addblock: function(block_type, param) {
		block_id = block_type+"_"+(parseInt(Object.keys(this.blocksObject['blocks']).length) + 1);
	
		var new_block = $.extend({
			"id"      : block_id,
	        "type"    : block_type,
	        "width"   : 50,
	        "height"  : 50,
	        "left"    : 100,
	        "top"     : 100,
	        "text"    : "",
	        "addclass": ""
	    }, param);

		if (this.is_editable)
			new_block.addclass += " drag";

		this._addblock(new_block);
	},

	_addblock: function(object_data) {
		if (object_data.type == "dot") {
			object_data.width = 10;
			object_data.height = 10;
			
			if (!this.is_editable) {
				object_data.left = object_data.left + Math.ceil(object_data.width  / 2);
				object_data.top  = object_data.top  + Math.ceil(object_data.height / 2);
				object_data.addclass = " notedit";
			}
		}

		if (!this.is_editable) {
			var tmp = object_data.addclass;
			var new_class = [];
			tmp = tmp.split(" "); 
			for (var i = tmp.length - 1; i >= 0; i--) {
				if (tmp[i] != "" && tmp[i] != "drag")
					new_class[new_class.length] = tmp[i]
			};
			object_data.addclass = " "+new_class.join(" ");
		}

		this.blocksObject['blocks'][object_data.id] = object_data;
		this.last_block = object_data.id;

		$(this.frame_id).append("<div class='"+object_data.type+object_data.addclass+"' id='"+object_data.id+"' style='top: "+object_data.top+"px; left: "+object_data.left+"px; width: "+object_data.width+"px; height: "+object_data.height+"px;'>"
									+"<div class='handler content'>"+object_data.text+"</div>"
							   +"</div>");

		if (this.is_editable)
			if (blocks.dblclick != "")
				if (object_data.type != "dot")
					$("#"+object_data.id).on("dblclick", function() {
						window[blocks.dblclick](object_data.id);
					});
	},

	addarrow: function(arrow_type, block_from, block_to) {
		var new_arrow = {
			"arrow_type": arrow_type,
			"block_from": block_from,
			"block_to": block_to
			}

		this._addarrow(new_arrow);
	},

	_addarrow: function(object_data) {
		switch (object_data.arrow_type) {
			case "arrow":
				arrowsDrawer.arrow("#"+object_data.block_from, "#"+object_data.block_to, { arrow: { connectionType: 'rectangleAuto' }});
			break;

			case "line":
				arrowsDrawer.arrow("#"+object_data.block_from, "#"+object_data.block_to, { arrow: { arrowType: 'line', connectionType: 'rectangleAuto' }});
			break;

			default:
				return false;
		}

		arrow_id = object_data.arrow_type + "_" + object_data.block_from + "_" + object_data.block_to;
		this.blocksObject['arrows'][arrow_id] = object_data;
	},

	update: function(id, new_object_data) {
		var object_data = this.blocksObject['blocks'][id];
		var new_object_data = $.extend(object_data, new_object_data);
		this.blocksObject['blocks'][id] = new_object_data;
	},

	getnextcoords: function(width, height) {
		var frame_width  = $(this.frame_id).getCss("width");
		var frame_height = $(this.frame_id).getCss("height");

		/* TODO: Добавить проверку, что бы за границы не выставляло */

		if (this.last_block == "") {
			new_left = Math.round(frame_width / 2) - Math.round(width / 2);
			new_top = 25;
		}
		else {
			new_left = $("#"+this.last_block).getCss("left");
			new_top = $("#"+this.last_block).getCss("top") + $("#"+this.last_block).getCss("height") + 50;
		}

		return {"left": new_left, "top": new_top };
	},

	drag: function() {
		if (this.is_editable) {
			$('.drag').Drags({
				handler: '.handler',
				onMove: function(e) {
					arrowsDrawer.redraw();
					if (blocks.debug) {
					 	var coords = blocks.getdragcoords(e);
					 	$('.debug').html('Текущая позиция: (слева:'+coords.left+' , сверху:'+coords.top+')');
					}
				},
				onDrop: function(e) {
					var coords = blocks.getdragcoords(e);
					var element_id = e.data.dragData.handler.parent("div").attr("id");
					
					blocks.blocksObject['blocks'][element_id].left = coords.left;
					blocks.blocksObject['blocks'][element_id].top = coords.top;
				},
				"frame_id": this.frame_id,
				"in_grid": this.in_grid
			});
		}
	},

	getdragcoords: function(e) {
		var dragData = e.data.dragData;
		var left = dragData.left + e.pageX - dragData.offLeft;
	    var top  = dragData.top + e.pageY - dragData.offTop;

	    if (blocks.max_left == 0)
            blocks.max_left = $(blocks.frame_id).getCss("width");

        if (blocks.max_top == 0)
            blocks.max_top = $(blocks.frame_id).getCss("height");

        if (left <= 0)
            left =  0;

        if (left >= (blocks.max_left - dragData.width - 2))
            left =  (blocks.max_left - dragData.width - 2);

        if (top <= 0)
            top =  0;

        if (top >= (blocks.max_top - dragData.height - 2))
            top =  (blocks.max_top - dragData.height - 2);

        if (this.in_grid) {
			top  = Math.ceil(Math.ceil(top  / 10) * 10);
			left = Math.ceil(Math.ceil(left / 10) * 10);
        }

	    return {"left": left, "top": top}
	},

	getobject: function() {
		return this.blocksObject;
	},

	save: function() {
		return JSON.stringify(this.blocksObject);
	},

	load: function(json_data) {
		try {
			load_data = JSON.parse(json_data);
			blocks.blocksObject = { 'blocks': {}, 'arrows': {} };
			$(this.frame_id+" div").detach();
			arrowsDrawer.clear();

			if (typeof(load_data['blocks']) == "object")
				$.each(load_data['blocks'], function(index, value) {
					blocks._addblock(value);
				});

			if (typeof(load_data['arrows']) == "object")
				$.each(load_data['arrows'], function(index, value) {
					blocks._addarrow(value);
				});

			blocks.drag();
		} catch(e) {
			alert("Ошибка загрузки JSON: "+e);
		}
	},

	grid: function(e) {
		if (e) {
			$(this.frame_id).addClass("grid");
		}
		else {
			$(this.frame_id).removeClass("grid");	
		}

		this.in_grid = e;
		blocks.drag();
	},

	debug: function(e) {
		if (e) $("body").append("<div class='debug'></div>");
		this.debug = e;
	},
}