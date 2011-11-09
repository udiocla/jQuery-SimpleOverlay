
/******************************************************************************************
 *
 *		jQuery SimpleOverlay
 *		-----------------------------------------------------------------------------------		
 *		Developer: Rogerio Pinto
 *		Website: http://www.rogeriopinto.com
 *		Date: 10-10-2011
 *		
 ***/

(function($){// ------------------------------------------------------------------------------------	jQuery Closure
	
$.fn.SimpleOverlay = function(options){// ----------------------------------------------------------	$.fn.SimpleOverlay	
	
		
/******************************************************************************************
 *
 *	SETTINGS
 *
 ***/ 
	var o = $.extend({

		duration: 300,	//this is how long it will take to animate anything in this implementation
		effect: 'linear',	//this is the effect that is going to be used to animate anything
		transited: function(){	//Indicates whether the slider will use css3 for animation or jQuery animate
					return (typeof Modernizr != 'undefined' 
					        && Modernizr.csstransitions);
				},

//------------------------------------------------------ Settings for fallback

		fallbackId: 'fallback',	//ID of the fallback
		fallbackOpacity: 0.4,	//Opacity the fallback will be shown
		clickableFallback: true,	//Can the fallback also be used to close the overlay via clicking?
		
//------------------------------------------------------ Settings for overlay

		overlayQuery: '.overlay',	//search for the overlay in the DOM with this query
		overlayClass: 'overlay',	//Use this as the class of the overlay
		overlayDefaultTop: 20,		//This is the minimum default top position of the overlay
		overlayDefaultLeft: 20,		//This is the minimum default left position of the overlay
		overlayFixedTop: false,		//Is the overlay going to adopt a fixed position?
		
//------------------------------------------------------ Settings for content

		contentClass: 'content',	//Use this as the class of the content area
		
//------------------------------------------------------ Settings for close
		
		hasCloseBtn: true,			//Is there going to be a close button?
		closeBtnClass: 'close',		//Use this as the class of the button
		closeBtnText: 'x',			//Use this as the text of the button
		
//------------------------------------------------------ Event Hooks

		onInitialize: function(){},
		onClick: function(){return true;},
		onCloseBtnClick: function(){return true;}, //Used when the close button is clicked. If it returns true the overlay is closed. If returns false the overlay stays open
		onFallbackClick: function(){return true;}, //Used when the fallback is clicked. If it returns true the overlay is closed. If returns false the overlay stays open
		beforeShow: function(){},
		afterShow: function(){},
		beforeHide: function(){},
		afterHide: function(){},
		beforeShowContent: function(){},
		afterShowContent: function(){},
		beforeHideContent: function(){},
		afterHideContent: function(){},
		beforeResize: function(){},
		afterResize: function(){},
		beforeSetContent: function(){},
		afterSetContent: function(){},
		beforeAddContent: function(){},
		afterAddContent: function(){}
		
	},options);


/******************************************************************************************
 *
 *	PROPERTIES
 *
 ***/
	var win = null;			//Reference to win specs
	var bod = null;			//Reference to body specs
	var fallback = null;
	var overlay = null;		//Reference to overlay
	var content = null;
	var closeBtn = null;	//Reference to close button
	
	

/******************************************************************************************
 *
 *	METHODS
 *
 ***/

	function getWindowSpecs(){//Caches window specs
		var w = $(window);
		win = {
			width: w.width(),
			height: w.height(),
			scrollTop: w.scrollTop()
		};
	}
	
	function getBodSpecs(){//Caches window specs
		var b = $(document.body);
		bod = {
			width: b.width(),
			height: b.height()
		};
	}
	
	if(o.transited()){//If css transitions is supported
		var anime = function(settings){//Set the animation function with that
			
			var s = $.extend({
				style: {},
				duration: o.duration,
				after: function(){}
			},settings);
			
			var properties = new Array();
			for(var i in s.style){
				properties.push(i + ' ' +  s.duration + 'ms ease-in-out');
			}
			
			var t = properties.join(',');
			
			
			this.css($.extend({
				'-webkit-transition': t,
				'-moz-transition': t,
				'-ms-transition': t,
				'-o-transition': t,
				'transition': t
			},s.style));
			
			setTimeout(s.after,s.duration);
		};
	} else {//If css transitions is not supported
		var anime = function(settings){//Use the jQuery animation instead
			var s = $.extend({
				style: {},
				duration: o.duration,
				after: function(){}
			},settings);
			this.animate(s.style,s.duration,o.effect,s.after);
		};
	}
	
// ---------------------------------------------------------------------------------------------------	Fallback

	function getFallback(){//Gets fallback
		fallback = $('<div />')
			.attr({
				id: o.fallbackId
			})
			.click(function(){
				if(o.clickableFallback && o.onFallbackClick()){//If click is enabled and the click call has been successful
					hide();
				}
			})
			.appendTo(document.body);//Add fallback to body
	}
	
	function resizeFallback(){//Resizes fallback
		
		var overlayEnd = (overlay.position().top + overlay.outerHeight()); //The top position where the overlay ends
		
		if(overlayEnd > bod.height){//If the top end position of the overlay is heigher than the body height
			var height = (overlayEnd + 50);//Add extra padding between the overlay and the end of the page
		} else if(win.height > bod.height){//If window height is bigger than the height of the document
			var height = win.height;//Use the height of the window
		} else {//Otherwise
			var height = bod.height;//Use the body height
		}
		
		fallback.css({//Set dimensions
			width: bod.width,
			height: height
		});
	}
	
	function showFallback(){//Displays fallback
		fallback
			.css({//Set it up for animation
				opacity: 0,
				display: 'block'
			})
			
		anime.call(fallback,{
			style:{opacity: o.fallbackOpacity},
			after:afterShowFallbackAnimation
		});
	}
	
	function afterShowFallbackAnimation(){
		$(window).bind('resize',refresh);//Watch for window resize
		o.afterShow();//After it has been shown call this hook
	}
	
	function hideFallback(){
		anime.call(fallback,{
			style:{opacity: 0},
			after: afterHideFallbackAnimation
		});
		$(window).unbind('resize',refresh);//Unwatch window resize
	}
	
	function afterHideFallbackAnimation(){
		fallback.css({
			display: 'none'
		});
		o.afterHide();//After the fallback has been hidden call this hook
	}
	
// ---------------------------------------------------------------------------------------------------	Close button

	function getCloseBtn(){//Gets close button
		if(!o.hasCloseBtn){//If the close button is disabled return
			return;
		}
		closeBtn = $('<a></a>')//Create close button
			.attr({
				'class': o.closeBtnClass,
				href: '#',
				title: 'close'
			})
			.text(o.closeBtnText)
			.click(function($e){//When the close button is clicked
				$e.preventDefault();
				if(o.onCloseBtnClick()){//If the check function returns true
					hide();//Hide it
				}
			})
			.appendTo(overlay);//Attach button to overlay
	}
	
	function hideCloseBtn(){
		if(!o.hasCloseBtn){//If the close button is disabled return
			return;
		}
		closeBtn.css('display','none');
	}
	
	function showCloseBtn(){
		if(!o.hasCloseBtn){//If the close button is disabled return
			return;
		}
		closeBtn.css('display','block');
	}

// ---------------------------------------------------------------------------------------------------	Overlay

	function getOverlay(){//Gets overlay
		overlay = $(o.overlayQuery);
		
		if(overlay.length == 0){//If overlay has not been set
			overlay = $('<div />')
				.attr({
					'class': o.overlayClass
				})
				.appendTo(document.body);
		}
	}
	
	function showOverlay(){//Displays the overlay
		overlay
			.css({
				opacity: 0,
				display: 'block'
			});
			
		anime.call(overlay,{
			style:{opacity: 1},
			after:showCloseBtn
		});
	}
	
	function hideOverlay(){//Hides overlay
		anime.call(overlay,{
			style: {opacity: 0},
			after: afterHideOverlayAnimation
		});
	}
	
	function afterHideOverlayAnimation(){//Hides overlay
		overlay.css({
			display: 'none'
		});
	}
	
	if(o.transited()){//if css transitions is supported
		var positionOverlay = function(){
			var pos = getOverlayPos(overlay.outerWidth(),overlay.outerHeight());
			overlay.css({margin: 0});
			anime.call(overlay,{
				style: {top: pos.top,left: pos.left}
			});
		};
	} else {
		var positionOverlay = function(){
			var pos = getOverlayPos(overlay.outerWidth(),overlay.outerHeight());
			overlay.css({
				margin: 0,
				top: pos.top,
				left: pos.left
			});
		};
	}	
		
	function getOverlayPos(width,height){//Gets position of overlay
		
		if(bod.height < win.height){//if the window area is bigger than the body
			var nHeight = bod.height;//Use the body height
		} else {//Otherwise
			var nHeight = win.height;//Use the window height
		}
		
		var minTop = win.scrollTop + o.overlayDefaultTop;
		
		var top = (win.scrollTop + (nHeight / 2)) - (height / 1.5);//Calculate top position
		
		if(o.overlayFixedTop || top < minTop){//If the overlay is to have its top position fixed or the top position is less than the minimum top position
			top = minTop;//Use the minimum top position
		}
		
		if(width > bod.width){//If width is wider than the window
			var left = o.overlayDefaultLeft;//use the minimum left position
		} else {
			var left = ((bod.width / 2) - (width / 2));//Calculate the left position
		}
		
		return {//Return the calculated position
			top: top,
			left: left
		};
	}
	
	function resizeOverlay(settings){//Resizes overlay
		var s = $.extend({
			animate: true,
			showContent: false,
			positioning: true,
			width: content.outerWidth(true),
			height: content.outerHeight(true)
		},settings);
		
		getWindowSpecs();//Get window specs
		getBodSpecs();//Get body specs
		
		var pos = getOverlayPos(s.width,s.height);//Calculate overlay position
		
		if(s.positioning){//If the position is also to be adjusted
			var style = {
				width: s.width + 'px',
				height: s.height + 'px',
				top: pos.top,
				left: pos.left
			};
		} else {//Otherwise just do the dimensions
			var style = {
				width: s.width + 'px',
				height: s.height + 'px'
			};
		}
		
		anime.call(overlay,{
			style: style,
			duration: ((s.animate) ? o.duration : 0),
			after: afterResizeOverlayAnimation
		});
	}
	
	function afterResizeOverlayAnimation(){//Call this after the animation to resize the overlay
		showCloseBtn();
		o.afterResize();
	}
	
// ---------------------------------------------------------------------------------------------------	Content

	function getContent(){//Gets or creates the content area
		content = overlay.find('.' + o.contentClass);
		
		if(content.length == 0){//If overlay has not been set
			content = $('<div />')
				.attr({
					'class': o.contentClass
				})
				.appendTo(overlay);
		}
	}
	
	function showContent(settings){//Displays the content area
		var s = $.extend({
			animate: true
		},settings);
		
		o.beforeShowContent();
		
		content.css({opacity:0});
		
		anime.call(content,{
			style: {opacity: 1},
			duration: ((s.animate) ? o.duration : 0),
			after: afterShowContentAnimation
		});
	}
	
	function afterShowContentAnimation(){//This is called after the animation to show the content area
		showCloseBtn();
		o.afterShowContent();
	}
	
	function hideContent(settings){//Hides overlay
		var s = $.extend({
			animate: true
		},settings);
		
		o.beforeHideContent();//Before hiding it call this function
		
		hideCloseBtn();//hide the close button so that the animation looks better
		
		anime.call(content,{//Hide it
			style:{opacity: 0},
			duration: ((s.animate) ? o.duration : 0),
			after: afterHideContentAnimation
		});
	}
	
	function afterHideContentAnimation(){//This is called after hiding the content area
		o.afterHideContent();
	}
	
	function setContent(str){//Sets the contents of the content area
		if(typeof str == 'undefined'){
			str = '';
		}
		o.beforeSetContent();//Before setting the content run this
		content.html(str);//Set the content
		o.afterSetContent();//After setting the content run this
	}
	
	function addContent(str){//Adds content to the content area
		if(typeof str == 'undefined'){
			str = '';
		}
		o.beforeAddContent();
		content.append(str);
		o.afterAddContent();
		//refresh();
	}
	
	function resizeContent(settings){//Resizes the content area
		var s = $.extend({
			width: content.width(),
			height: content.height()
		},settings);
		
		content.css({
			width: s.width,
			height: s.height
		})
	}

	
// -------------------------------------------------------------------------------------------	
	
	function hide(){//Hides overlay
		o.beforeHide();
		hideOverlay();
		hideFallback();
	}
	
	function show(){//Shows overlay
		o.beforeShow();
		getWindowSpecs();
		getBodSpecs();
		positionOverlay();
		showOverlay();
		resizeFallback();
		showFallback();
	}
	
	function resize(settings){//Resizes
		hideCloseBtn();//Hide close button
		o.beforeResize();
		resizeContent(settings);
		resizeOverlay(settings);
	}
	
	function refresh(){//Refreshes the positioning and dimensions of the elements
		setTimeout(function(){
			getWindowSpecs();
			getBodSpecs();
			positionOverlay();
			resizeFallback();
		},100);
	}

/******************************************************************************************
 *
 *	API
 *
 ***/

	this.show = function(){
		show();
		return this;
	};
	
	this.hide = function(){
		hide();
		return this;
	};
	
	this.disableClickableFallback = function(){
		o.clickableFallback = false;//Make fallback unclickable
		return this;
	};
	
	this.enableClickableFallback = function(){
		o.clickableFallback = true;//Make fallback unclickable
		return this;
	};
	
	this.enableClose = function(){//Enables the click on the close button and the fallback
		o.hasCloseBtn = true;
		if(!closeBtn){
			getCloseBtn();
		}
		return this;
	};
	
	this.disableClose = function(){//Enables the click on the close button and the fallback
		hideCloseBtn();//Hide the button
		o.hasCloseBtn = false;//Disable it
		return this;
	};
	
	this.showCloseButton = function(){
		showCloseBtn();
		return this;
	};
	
	this.hideCloseButton = function(){
		hideCloseBtn();
		return this;
	};
	
	this.resize = function(settings){
		resize(settings);
		return this;
	};
	
	this.hideContent = function(settings){
		hideContent(settings);
		return this;
	};
	
	this.showContent = function(settings){
		showContent(settings);
		return this;
	};
	
	this.setContent = function(str){
		setContent(str);
		return this;
	};
	
	this.addContent = function(str){
		addContent(str);
		return this;
	};
	
	this.getContentRef = function(){
		return content;
	};
	
	this.getMaxContentDims = function(){
		getWindowSpecs();
		var frameDim = {//Get the difference in space between the content area and the overlay element
			horizontal: (overlay.outerWidth() - content.innerWidth()),
			vertical: (overlay.outerHeight() - content.innerHeight())
		}
		return {//Return the calculated maximum allowable dimensions
			width: win.width - frameDim.horizontal - (o.overlayDefaultLeft * 2),
			height: win.height - frameDim.vertical - (o.overlayDefaultTop * 2)
		};
	};
	
	
			
/******************************************************************************************
 *
 *	INIT
 *
 ***/	

	getFallback();//Get fallback
	getOverlay();//Get overlay
	getContent();//Content
	getCloseBtn();//Get close button
	
	o.onInitialize();		//After it has all been initialized
			
	return this.click(function($e){//For all elements
		$e.preventDefault();
		var e = $(this);
		var clickResponse = o.onClick.call(e,$e);
		if(clickResponse){
			show();
		}
	});//End - return
		
};// -------------------------------------------------------------------------------------------	$.fn.SimpleOverlay
	
	
})(jQuery);// --------------------------------------------------------------------------------------	jQuery Closure





















