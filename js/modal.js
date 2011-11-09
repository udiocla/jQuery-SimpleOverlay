
var overlay = null;

jQuery(document).ready(function($){// -----------------------------------------------------------	DOCUMENT READY
	
	function getOverlayOkContent(){
		var content = $('<p></p>');//Create content for overlay
		content.text('Please click on \'OK\'.');
		$('<a></a>')
			.attr({
				'class': 'ok',
				href: '#',
				title: 'ok'
			})
			.text('ok')
			.click(function($e){//when the ok button is clicked
				$e.preventDefault();
				overlay.hide();//hide the overlay
			})
			.appendTo(content);
		return content;
	}
	
	function getLoginForm(){
		var content = $('<div></div>').html(//Create content for overlay
			'<p>Enter your username and password</p>'
			+ '<p class="hasFloat">'
			+ '<label>Username:</label>'
			+ '<input type="text" id="username" val="" />'
			+ '</p>'
			+ '<p class="hasFloat">'
			+ '<label>Password:</label>'
			+ '<input type="password" id="password" val="" />'
			+ '</p>'
		);
	
		var p = $('<p class="hasFloat"></p>').appendTo(content);
		$('<a></a>')
			.attr({
				'class': 'login',
				href: '#',
				title: 'login'
			})
			.text('login')
			.click(function($e){//when the ok button is clicked
				$e.preventDefault();
				var usernameOk = ($.trim($('#username').val()) != '');
				var passwordOk = ($.trim($('#password').val()) != '');
				if(!usernameOk || !passwordOk){
					var error = $('.overlay .error');
					if(error.length == 1){
						error.css('opacity',0).animate({opacity:1},250,'easeInOutQuad');
					} else {
						$('<p class="error">You must enter your username and password</p>')
						.stop()
						.css('opacity',0)
						.insertAfter('.overlay .content p:first')
						.animate({opacity:1},250,'easeInOutQuad');
						overlay.resize({height:230,animate:false});
					}
				} else {
					overlay.hideContent({animate:false});
					
						overlay
							.setContent(getOverlayOkContent())
							.resize({
								height: 80,
								animate:false,
								positioning: false
							})
							.disableClose()
							.disableClickableFallback()
							.showContent({animate:false});
					
				}
				
			})
			.appendTo(p);
		return content;
	}
	
	//This is the minimum requirement
	
	overlay = $('.overlay-anchor').SimpleOverlay({
		
		onClick: function($e){		//When one of the anchor tags is clicked
			
			if(this.attr('id') == 'overlay-ok'){
				
				overlay
					.setContent(getOverlayOkContent())
					.resize({
						width:300,
						height:80,
						animate:false
					})
					.disableClose()
					.disableClickableFallback()
					.showContent({animate:false});
					
					
			} else {
				
				overlay
					.setContent(getLoginForm())
					.resize({
						width:300,
						height:175,
						animate:false
					})
					.enableClose()
					.enableClickableFallback();	
			}
			
			return true; //Prevent the default overlay display action from taking place
		}
		
	});
	
});// -------------------------------------------------------------------------------------------	DOCUMENT READY



