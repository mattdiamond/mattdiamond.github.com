(function ($) {
	$.fn.whoa = function (options) {
		this.each(function (i, el) {
			whoaIt($(el), options);
		});
	};

	function whoaIt($el, options) {
		options = options || {};

		var
			text = $el.text(),
			distance = options.distance || 1000,
			duration = options.duration || '10000s',
			timing = options.timing || 'linear';

		//just let it all go
		$el.empty();

		//and build a new world
		$.each(text.split(''), function (i, c) {
			var $span = $('<span>').text(c);
			$el.append($span);
			$span.css({
				position: 'relative',
				top: '0px',
				left: '0px',
				transition: 'all ' + duration + ' ' + timing
			});
			setTimeout(function () {
				$span.css({
					top: getRandomLength(distance),
					left: getRandomLength(distance)
				});
			}, 0);
		});
	}

	function getRandomLength(max) {
		return Math.random() * 2 * max - max + 'px';
	}
})(jQuery);