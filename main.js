/*
 * File for main functions
 * Handles animations login and menu
 */
$(document).ready(function() {
	
	$('#content').ajaxify({
		scrolltop: true,
		forms: "form:not([class='loginForm'])",
		requestDelay: 150
	});

	//Please set requestDelay in settings to the same value as in fRequest below, and use this code
 
	jQuery(window).on("pronto.request", fRequest).on("pronto.render", fRender);
 
	function fRequest() {

    	jQuery("#content").fadeOut(150); // requestDelay setting must be same as this animation duration
    	whileLoading();
	}
 
	function fRender() {

		doneLoading();
    	jQuery("#content").stop(true, false).fadeIn(250);
	}

	// Login Function
	$('.loginForm').on('submit', function(event) {
		
		event.preventDefault();

		$.ajax({
			url: '/Workers/backEnd/loginForm.php',
			data: $('.loginForm').serializeArray(),
			type: 'post',
			dataType: "JSON",
			success: function(data) {

				$('#cont').html(data['message']);

				if(data['action'] == 1) {

					$('#cont').css('background-color', '#00cc21');
					location.reload(true);
				}
			},
			error: function(xhr, status, error) {

  				console.log(xhr.responseText);
  				console.log(error);
			}
		});
	});

	let initial = 0;

	$('#refreshButton').on("click touchstart", function(e) {
		
		e.stopImmediatePropagation();
		initial += 360;
		$('#refreshButton').css("transform", "rotate(" + initial + "deg)");
		location.reload();
		//$('#content').load(window.location.href + " #content > *");
	});

	//settings Menu
	let menuOpen = false;
	var xDown = null;                                                        
	var yDown = null;

	$(document).on('touchstart', function(evt) {
		if(menuOpen == false) {

			if(evt.touches[0].clientX >= 50) {
				return;
			}
		}else {
			if(evt.touches[0].clientX <= 120) {
				return;
			}
		}
		const firstTouch = getTouches(evt)[0];                                      
    	xDown = firstTouch.clientX;                                      
    	yDown = firstTouch.clientY; 
	});

	$(document).on('touchmove', function(evt) {

		if (!xDown || !yDown) {
        	return;
    	}

    	var xUp = evt.touches[0].clientX;                                    
    	var yUp = evt.touches[0].clientY;

    	var xDiff = xDown - xUp;
    	var yDiff = yDown - yUp;

    	if (Math.abs( xDiff ) > Math.abs( yDiff ) ) {

        	if ( xDiff > 0 ) {

            	menuOpen = false;
				$('#settings').css('left', '-80vw');
				$('#settings').css('box-shadow', 'none');
				$('header').css('box-shadow', '3px 3px 3px #D8D8D8');
        	} else {

        		menuOpen = true;
				$('#settings').css('left', '0vw');
				$('#settings').css('box-shadow', 'var(--mainBoxShadow)');
				$('header').css('box-shadow', 'none');
        	}                                                                                       
    	}
    	
    	xDown = null;
    	yDown = null;
	});

	function getTouches(evt) {
  		return evt.touches; // jQuery
	}                                                                                                  

	$('#menuButton').on('click', function() {

		$('main').on('click', function() {
			menuOpen = false
			$('#settings').css('left', '-80vw');
			$('#settings').css('box-shadow', 'none');
			$('header').css('box-shadow', '3px 3px 3px #D8D8D8');
		});

		if(menuOpen == true) {

			menuOpen = false
			$('#settings').css('left', '-80vw');
			$('#settings').css('box-shadow', 'none');
			$('header').css('box-shadow', '3px 3px 3px #D8D8D8');
		}else {

			menuOpen = true;
			$('#settings').css('left', '0vw');
			$('#settings').css('box-shadow', 'var(--mainBoxShadow)');
			$('header').css('box-shadow', 'none');
		}
	});

	$('#settings a').on('click', function() {
		if(menuOpen == true) {
			
			menuOpen = false;
			$('#settings').css('left', '-80vw');
			$('#settings').css('box-shadow', 'none');
			$('header').css('box-shadow', '3px 3px 3px #D8D8D8');
		}
	});
});

//loading screen
function whileLoading() {
	
	$('#reloadCircle').css('display', 'none');
	$('#loadingCircle').css('display', 'initial');
}

function doneLoading() {
	
	$('#loadingCircle').css('display', 'none');
	$('#checkArrow').css('display', 'initial');
	window.setTimeout(function() {

		$('#checkArrow').css('display', 'none');
		$('#reloadCircle').css('display', 'initial');
	}, 420);
}