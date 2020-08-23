/*
 * This file is for all happenings on /lieferschein.php
 * It handles printing, writing back and editing.
 */
$(document).ready(function() {

	let gesamtKistenArray = [],
		gesamtFlaschenArray = [],
		verbrauchtKistenArray = [],
		verbrauchtFlaschenArray = [],
		zurückKistenArray = [],
		zurückFlaschenArray = [],
		bestellAnzahlArray = [],
		maxFlArray = [],
		zwischenergebnis,
		zwischenergebnisFl,
		bestellIdArray = [],
		deleteColumns = [],
		executeDelete = 0,
		editLSClicked = false,
		zSButtonClicked = false,
		lieferscheinId = $('#Identifikationsnummer').text(),
		status = $('#hiddenStatus').text();
		/* hiddenStatus is the status of the delivery note. Its the same as 'listFilter' */
	switch($('#hiddenStatus').text()) {

		case '0':
		$('#druckRZ').css('display', 'none');
		break;
		case '1':
		$('#druckRZ').css('display', 'none');
		break;
		case '2':
		$('#zSButton').css('display', 'none');
		$('#druckLS').css('display', 'none');
		break;
		case '3':
		$('#zSButton').css('display', 'none');
		$('#druckLS').css('display', 'none');
		break;
	}

	$('#druckLieferschein').css('display', 'none');

	$('#druckLS').on('click', function() {

		window.onbeforeprint = function() {
			/* several parts are appended or cloned because I needed to print 2 delivery notes. */
			$('head').append('<link id="printLSLink" rel="stylesheet" href="styles/lSDruck.css" type="text/css">');
			$('#allDatas').clone().appendTo('#content');
			$('#content').append("<div id='costumerQuote'>Dieser Ausdruck ist für den Kunden bestimmt. Bitte bewahren Sie ihn gut auf.</div>");
			$('#tableStation').append("<div id='costumerQuote2'>Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum des Lieferanten.</div>");
			$('#costumerQuote').css('position', 'absolute');
			$('#costumerQuote').css('bottom', '25mm');
		}

		window.print();
		$('#allDatas:last').remove();
		$('#printLSLink').remove();
		$('#costumerQuote').remove();
		$('#costumerQuote2').remove();

		window.onafterprint = function() {

			$.ajax({
				url: '/Workers/lieferscheinprogramm/backEnd/changeStatus.php',
				data: {
					status: "1",
					id: lieferscheinId
				},
				type: 'post',
				dataType: 'JSON',
				success: function(data) {

					console.log(data.message);
				},
				error: function(xhr, status, error) {

  					console.log(xhr.responseText);
  					console.log(error);
				}
			}); 
		}
	});

	/* this function is for printing the written back delivery note. The button only appears when its written back */
	$('#druckRZ').on('click', function() {

		$('#productHead tr').append("<td class='lSDruck'>Berechnungen</td>");
		$('#productBody tr').append("<td class='lSDruck'></td>");
		$('head').append('<link rel="stylesheet" href="styles/rZDruck.css" type="text/css">');
		window.print();

		window.onafterprint = function() {
			
			$.ajax({
				url: '/Workers/lieferscheinprogramm/backEnd/changeStatus.php',
				data: {
					status: "3",
					id: lieferscheinId
				},
				type: 'post',
				dataType: 'JSON',
				success: function(data) {

					console.log(data.message);
				},
				error: function(xhr, status, error) {

  					console.log(xhr.responseText);
  					console.log(error);
				}
			}); 
		}
	});

	$('#editLS').on('mousedown', function(e) {

		e.stopImmediatePropagation();
		if(editLSClicked) {

			$('#tableStation').load(window.location.href + " #tableStation > *");
			document.getElementById('zSButton').disabled = false;
			editLSClicked = false;
		}else {

			document.getElementById('zSButton').disabled = true;
			editLS();
			editLSClicked = true;
		}
	});

	$('#zSButton').on('mousedown', function(e) {

		e.stopImmediatePropagation();
		if(zSButtonClicked) {

			$('#tableStation').load(window.location.href + " #tableStation > *");
			document.getElementById('editLS').disabled = false;
			zSButtonClicked = false;
		}else {

			document.getElementById('editLS').disabled = true;
			sortNew();
			zSButton();
			zSButtonClicked = true;
		}
	});

	//edit the delivery note
	function editLS() {

		$('#productBody tr').each(function() {

			$(this).append("<button class='emoji deleteButton'>🗑</button>");
		});

		let trString = "<tr><td><input id='warenInput' name='ware' type='text' placeholder='Ware...' autocomplete='off'></td>" + 
					   "<td><input id='warenAnzahl' type='number' placeholder='Anzahl...'></td>" + 
					   "<td><label><input id='flaschen' type='checkbox'>Fl.</label><button id='warenSubmit' class='emoji' type='submit' disabled>➕</button></td></tr>";

		$('#productBody').append(trString);

		$('#tableStation').append('<input class="emoji" type="submit" id="editSave" value="✔">');

		$.getScript('/Workers/lieferscheinprogramm/scripts/searchProducts.js');

		//delete rows
		$('.deleteButton').on('mousedown', function() {
			
			deleteColumns.push($(this).parent().children().attr('class', 'bestellIdHidden').val());
			$(this).parent().css("display", "none");
		});

		$('#editSave').on("click touchstart", function(e) {
			
			e.stopImmediatePropagation();
			this.disabled = 'disabled';

			if($('#productBody tr').length-1 == deleteColumns.length && warenArray.length == 0) {

				if(confirm('Zum löschen des Lieferscheins bestätigen')) {

					executeDelete = 1;
				}else {

					executeDelete = 0;
					this.disabled = false;
					return;
				}
			}

			/* and then save everythin edited. */
			$.ajax({
				url: '/Workers/lieferscheinprogramm/backEnd/updateLS.php',
				data: {
					lSStatus: status,
					deleteLS: executeDelete,
					lieferscheinId: lieferscheinId,
					deleteColumnsData: deleteColumns,
					warenInput: warenArray,
					warenAnzahl: warenAnzahlArray,
					flaschen: flaschenArray
				},
				type: 'post',
				dataType: 'JSON',
				success: function(data) {

					$('#cont').html(data.message);
					if(data.action == 1) {

						executeDelete = 0;
						$('#tableStation').load(window.location.href + " #tableStation > *");
					}
				},
				error: function(xhr, status, error) {

  					console.log(xhr.responseText);
  					console.log(error);
				}
			});
		});
	}

	//function for writing back
	function zSButton() {

		$('#productHead tr').append('<th>Zurück</th>');
		$('#productHead tr').append('<th>Gesamt</th>');

		let dataSort0 = '<td><input class="zurückKisten maximal rZInputs" type="hidden"><input class="zurückFlaschen rZInputs" type="text" readonly="" placeholder="Gesamt ->"></td>' + 
						'<td><input class="gesamtKisten maximal rZInputs" type="number" placeholder="Stückzahl..."></td><input class="gesamtFlaschen rZInputs" type="hidden">';

		let dataSort1 = '<td><input class="zurückKisten maximal rZInputs" type="number" placeholder="Flaschen..."><input class="zurückFlaschen rZInputs" type="hidden"></td>' + 
						'<td><input class="gesamtKisten maximal rZInputs" type="text" readonly="" placeholder="<- Zurück"></td><input class="gesamtFlaschen rZInputs" type="hidden">';

		let dataSort2 = '<td><input class="zurückKisten maximal rZInputs" type="number" placeholder="Stückzahl..."></td><input class="zurückFlaschen rZInputs" type="hidden">' +
						'<td><input class="gesamtKisten maximal rZInputs" type="number" placeholder="Stückzahl..."></td><input class="gesamtFlaschen rZInputs" type="hidden"></td>';

		let dataSort3 = '<td><input class="zurückKisten maximal rZInputs" type="number" placeholder="Kisten..."><input class="zurückFlaschen rZInputs" type="number" placeholder="Flaschen..."></td>' + 
						'<td><input class="gesamtKisten maximal rZInputs" type="number" placeholder="Kisten..."><input class="gesamtFlaschen rZInputs" type="number" placeholder="Flaschen..."></td>';

		let dataSort4 = '<td><input class="zurückKisten rZInputs" type="hidden"><input class="zurückFlaschen maximal rZInputs" type="number" placeholder="Flaschen..."></td>' + 
						'<td><input class="gesamtKisten rZInputs" type="hidden"><input class="gesamtFlaschen maximal rZInputs" type="number" placeholder="Flaschen..."></td>';

		$('#productBody tr').each(function() {

			let exp = new RegExp("Fl.");
			
			if($(this).data('sort') == '0') {

				$(this).append(dataSort0);
			}else if($(this).data('sort') == '1') {

				$(this).append(dataSort1);
			}else if($(this).data('sort') == '2') {

				$(this).append(dataSort2);
			}else if($(this).data('sort') == '3') {

				$(this).append(dataSort3);
			}else if($(this).data('sort') == '4') {

				$(this).append(dataSort4);
			}
		});

		/*
		 * It can sometimes happen that you accidently write more back than originally
		 * written on the delivery note. This is my idea to fix that problem
		 */
		let anzahl = $('.anzahl').text().split(/[ StkFlK."]+/);
		let i = 0;
		$('#productBody tr').each(function() {
			
			if(anzahl[i] == "") { anzahl[i] = 0 }
			bestellAnzahlArray.push(parseInt(anzahl[i]));
			$(this).find('.maximal').attr('max', anzahl[i]);
			let maxFl = $(this).find('.anzahl').attr('maxfl');
			maxFlArray.push(maxFl);
			i++;
		});

		//mark inputs fields yellow when there is more written back than possible.
		$('input[type="number"]').on('input', function(b) {
			if(parseInt($(this).val()) > parseInt($(this).attr('max'))) {
				$(this).css('outline', '2px #EAAD14 dashed');
			}else {
				$(this).css('outline', 'none');
			}
		});

		$('#tableStation').append('<input class="emoji" type="submit" id="zSSubmit" value="✔">');

		//save the written back delivery note.
		$('#zSSubmit').on('click touchstart', function(e) {

			if(!confirm('Rückschreibzettel speichern?')) {

				return;
			}

			e.stopImmediatePropagation();
			this.disabled = true;

			$('.bestellIdHidden').each(function () {
				if(this.value == "") { this.value = "0" }
				bestellIdArray.push(parseInt(this.value));
			});

			$('.gesamtKisten').each(function () {
				if(this.value == "") { this.value = "0" }
				gesamtKistenArray.push(parseInt(this.value));
			});

			$('.gesamtFlaschen').each(function () {
				if(this.value == "") { this.value = "0" }
				gesamtFlaschenArray.push(parseInt(this.value));
			});

			$('.zurückKisten').each(function () {
				if(this.value == "") { this.value = "0" }
				zurückKistenArray.push(parseInt(this.value));
			});

			$('.zurückFlaschen').each(function () {
				if(this.value == "") { this.value = "0" }
				zurückFlaschenArray.push(parseInt(this.value));
			});
	
			//algorithm to calculate the difference between total and back to get the 'consumed' value		
			let i = 0;
			$('#productBody tr').each(function() {
				
				zwischenergebnis = bestellAnzahlArray[i] - zurückKistenArray[i];
				zwischenergebnisFl = maxFlArray[i] - zurückFlaschenArray[i];

				if($(this).data('sort') == "0") {
					verbrauchtKistenArray.push(0);
					verbrauchtFlaschenArray.push(0);
				}else if($(this).data('sort') == "1") {
					verbrauchtKistenArray.push(zwischenergebnis);
					verbrauchtFlaschenArray.push(0);
				}else if($(this).data('sort') == "2") {
					verbrauchtKistenArray.push(zwischenergebnis);
					verbrauchtFlaschenArray.push(0);
				}else if($(this).data('sort') == "3") {
					if($(this).find('.zurückFlaschen').val() == "0") {
						verbrauchtKistenArray.push(zwischenergebnis);
						verbrauchtFlaschenArray.push(0);
					}else {
						zwischenergebnis--;
						verbrauchtKistenArray.push(zwischenergebnis);
						verbrauchtFlaschenArray.push(zwischenergebnisFl);
					}
				}else if($(this).data('sort') == "4") {
					verbrauchtKistenArray.push(0);
					verbrauchtFlaschenArray.push(bestellAnzahlArray - zurückFlaschenArray);
				}
				i++;
			});

			$.ajax({
				url: '/Workers/lieferscheinprogramm/backEnd/saveRueckschreibzettel.php',
				data: {
					lieferscheinId: lieferscheinId,
					bestellId: bestellIdArray,
					gesamtKisten: gesamtKistenArray,
					gesamtFlaschen: gesamtFlaschenArray,
					verbrauchtKisten: verbrauchtKistenArray,
					verbrauchtFlaschen: verbrauchtFlaschenArray,
					zurückKisten: zurückKistenArray,
					zurückFlaschen: zurückFlaschenArray
				}, 
				type: 'post',
				dataType: 'JSON',
				success: function(data) {

					$('#cont').html(data.message);
					if(data.action == 1) {
						$('#content').load(window.location.href + " #content > *");
					}
				},
				error: function(xhr, status, error) {

  					console.log(xhr.responseText);
  					console.log(error);
				}
			});
		});
	}

	//this function sorts the delivery note new to make the writing back an easier work.
	function sortNew() {

		var items = $('#productBody tr');
		items.sort(function(a, b){

    		return +$(a).data('sort') - +$(b).data('sort');
		});
    
		items.appendTo('#productBody');
	}
});