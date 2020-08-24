/* lS.js handles handles the event on lS.php
 * Its a formular for making a new delivery note.
 */
$(document).ready(function() {

	$('#kundenname').css('display', 'block');
	$('#kundennameSubmit').css('display', 'block');

	$('#kundenname').focus();

	$('#kundennameSubmit').on('click', function(e) {
		
		if(!$('#kundenname').val()) {

			$('#cont').html('Feld muss ausgefüllt werden');
		}else {

			$('#kundenname').css('display', 'none');
			$('#kundennameSubmit').css('display', 'none');
			$('.lSRadio').css('display', 'block');
			$('.lSRadio').css('display', 'block');

			$('.lSRadio').on('click', function(e) {
				
				$('.lSRadio').css('display', 'none');
				$('.lSRadio').css('display', 'none');

				$('.warenForm').css('display', 'block');
				$('#lSSubmit').css('display', 'block');
				$('#warenInput').focus();

				$('#lSSubmit').on('click', function(e) {
					
					e.stopImmediatePropagation();
					e.preventDefault();
					$.ajax({
						url: '/Workers/lieferscheinprogramm/backEnd/saveLieferschein.php',
						data: { 
							formData: $('#lSForm').serializeArray(), 
							warenInput: warenArray, 
							warenAnzahl: warenAnzahlArray,
							flaschen: flaschenArray
						},
						type: 'post',
						dataType: 'JSON',
						success: function(data) {

							$('#cont').html(data.message);
							if(data.action == 1) {

								window.location.href = "/Workers/lieferscheinprogramm/lieferschein.php?id=" + data.idLocate;
							}
						},
						error: function(xhr, status, error) {
  							console.log(xhr.responseText);
						}
					});
				});
			});
		}
	});
});