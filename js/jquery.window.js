var jWindow = {
	wclass: "jwindow",

	open: function() {
		this.close();

		$("body").append("<div class='jfill'></div>");
		$("body").append("<div class='"+this.wclass+"'></div>");

		this.fillupdate();
		this.setcenter();

		$("body").on("click", ".jfill", function() {
			jWindow.close();
		});

		$(window).on("resize", function() {
			jWindow.fillupdate();
			jWindow.setcenter();		
		});

		$(window).on("keydown", function(e) {
			if (e.which == 27)
				jWindow.close();
		});

		$(window).on("scroll", function() {
			jWindow.fillupdate();
			jWindow.setcenter();
		});

		return this;
	},

	close: function () {
		$("."+this.wclass).detach();
		$(".jfill").detach();
		$(window).off("resize");
		$(window).off("keydown");
		$(window).off("scroll");
	},

	content: function(content) {
		$("."+this.wclass).html(content);
		this.setcenter();
	},

	setcenter: function() {
		var width = parseInt( $("."+this.wclass).width() );
		var height = parseInt( $("."+this.wclass).height() );
		
		posX = Math.round( ( $(window).width() / 2 ) - ( width / 2 ) );
		posY = Math.round( ( $(window).height() / 2 ) - ( height / 2) + $(window).scrollTop() );

		$("."+this.wclass).css("left", posX).css("top", posY);
	},

	fillupdate: function() {
		needHeight = parseInt($("html").outerHeight());
		if (needHeight < $(window).height()) { needHeight = $(window).height(); }
		
		$(".jfill").css("height", needHeight+"px");
	},
}