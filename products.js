/*
 * This file contains the logic and functions for waren.php
 * It handles the listing, editing and searching.
 */
$(document).ready(function() {

	let noDrink = false,
	    iterationNumber = 0,
	    warenHinzufügenClicked = false,
	    productName,
		productId,
		productPreise,
		productMaxFl;

	$('#warenHinzufügenBtn').on('touchstart click', function() {
		
		$('#warenForm').toggle();
	});


	$('#warenForm').find($('.formLayers')[iterationNumber]).css('display', 'block');

	// The form for adding new products to the table is splittet in several sections with a good reason.
	$('#nextStepBtn').on('click touchstart', function(e) {
		
		e.stopImmediatePropagation();
		e.preventDefault();

		if($('#warenForm').find($('.formLayers')[iterationNumber]).children('input[type="text"], input[type="number"]').val() == 0) {

			$('#cont').html('Feld muss ausgefüllt werden...');
			return;
		}

		$('#cont').empty();
		iterationNumber++;

		// Depending on a previous selected value, some sections are left out.
		if(document.getElementById('isDrinkRahmen').checked == false) {

			noDrink = true;
			if(iterationNumber == 2 || iterationNumber == 4) {

				$('#warenForm').find($('.formLayers')[iterationNumber-1]).css('display', 'none');
				$('#warenForm').find($('.formLayers')[iterationNumber]).css('display', 'block');
				iterationNumber++;
			}		
		}

		$('#warenForm').find($('.formLayers')[iterationNumber-1]).css('display', 'none');
		$('#warenForm').find($('.formLayers')[iterationNumber]).css('display', 'block');
		$('#warenForm').find($('.formLayers')[iterationNumber]).children('input[type="number"]').focus();

		if(iterationNumber == 5) {

			$('#nextStepBtn').css('display', 'none');
			$('#warenSubmit').css('display', 'block');
		}
	});

	//Saving the new product
	$('#warenSubmit').on('click touchstart', function(e) {
		
		e.preventDefault();
		e.stopImmediatePropagation();
		e.disabled = 'true';

		$('#warenForm').find($('.formLayers')[iterationNumber]).css('display', 'none');

		if(noDrink == true) {

			$('#maxFl').val('0');
			$('#einzelpreis').val('0');
		}

		$('#cont').html("Einen Moment...");

		$.ajax({
			url: '/Workers/lieferscheinprogramm/backEnd/saveProduct.php',
			data: $('form').serializeArray(), 
			type: 'post',
			dataType: 'JSON',
			success: function(data) {

				$('#cont').html(data.message);
				if(data.action == 1) {
					
					$('form')[0].reset();
					iterationNumber = 0;
					$('#warenSubmit').css('display', 'none');
					$('#warenForm').find($('.formLayers')[iterationNumber]).css('display', 'block');
					$('#nextStepBtn').css('display', 'block');
					$('#cont').html("Erfolgreich eingespeichert");
				}
			},
			error: function(xhr, status, error) {

  				console.log(xhr.responseText);
  				console.log(error);
			}
		});
	});

	// load products from the database
	function getAllProducts(startNumber) {
		
		$.ajax({
			url: '/Workers/lieferscheinprogramm/backEnd/getAllProducts.php',
			data: {data: startNumber}, 
			type: 'post',
			dataType: 'JSON',
			success: function(data) {

				if(data.action == 1) {

					listDatas(data);
				}else {
					$('#cont').html(data.message);
				}
			},
			error: function(xhr, status, error) {

  				console.log(xhr.responseText);
  				console.log(error);
			}
		});
	}

	getAllProducts(50);

	// depending on the isdrink data, some values may have a null value
	// This is the code to handle all possible varieties of the data structure.
	function listDatas(data) {
		
		for (var i = 0; i < data.waren.length; i++) {

			for (var i2 = 0; i2 < data.lg.length; i2++) {
							
				if(data.waren[i].leergutid == data.lg[i2].id) {

					productLg = data.lg[i2].kastenpfand + "€/" + data.lg[i2].flaschenpfand + "€/" + data.lg[i2].rahmenpfand + "€";
					break;
				}
			}

			$('.warenCont').first().clone().appendTo('#warenTabelle');

			$('#warenTabelle').find($('.nameValue')[i+1]).text(data.waren[i].ware);	
			$('#warenTabelle').find($('.idValue')[i+1]).text(data.waren[i].id);

			switch(data.waren[i].isdrink) {

				case "0":
				$('#warenTabelle').find($('.dataValue')[i+1]).attr('data-value', data.waren[i].isdrink).text("Leihware");
				$('#warenTabelle').find($('.pricesValue1')[i+1]).text(data.waren[i].kistenpreis + "€");
				$('#warenTabelle').find($('.pricesValue2')[i+1]).text("Nicht vorhanden");
				$('#warenTabelle').find($('.maxFlValue')[i+1]).text("Rahmen nicht vorhanden");
				$('#warenTabelle').find($('.lgValue')[i+1]).text("Dieses Produkt hat keinen Pfand");
				break;

				case "1":
				$('#warenTabelle').find($('.dataValue')[i+1]).attr('data-value', data.waren[i].isdrink).text("Wein, Sekt, Schnaps");
				$('#warenTabelle').find($('.pricesValue1')[i+1]).text(data.waren[i].kistenpreis + "€");
				$('#warenTabelle').find($('.pricesValue2')[i+1]).text("Nicht vorhanden");
				$('#warenTabelle').find($('.maxFlValue')[i+1]).text("Rahmen nicht vorhanden");
				$('#warenTabelle').find($('.lgValue')[i+1]).text("Dieses Produkt hat keinen Pfand");
				break;

				case "2":
				$('#warenTabelle').find($('.dataValue')[i+1]).attr('data-value', data.waren[i].isdrink).text("Getränk");
				$('#warenTabelle').find($('.pricesValue2')[i+1]).text("Nicht vorhanden");
				$('#warenTabelle').find($('.pricesValue1')[i+1]).text(data.waren[i].kistenpreis + "€");
				$('#warenTabelle').find($('.maxFlValue')[i+1]).text("Rahmen nicht vorhanden");
				$('#warenTabelle').find($('.lgValue')[i+1]).text("Dieses Produkt hat keinen Pfand");
				$('#warenTabelle').find($('.lgValue')[i+1]).text(productLg);
				break;


				case "3":
				$('#warenTabelle').find($('.dataValue')[i+1]).attr('data-value', data.waren[i].isdrink).text("Kastengetränk");
				$('#warenTabelle').find($('.pricesValue1')[i+1]).text(data.waren[i].kistenpreis + "€");
				$('#warenTabelle').find($('.pricesValue2')[i+1]).text(data.waren[i].einzelpreis + "€");
				$('#warenTabelle').find($('.maxFlValue')[i+1]).text(data.waren[i].maxfl);
				$('#warenTabelle').find($('.lgValue')[i+1]).text(productLg);
				break;
			}
		}

		$('.warenCont').first().remove();

		$('.editBtn').on('touchstart click', editProduct);  
	}

	// Same thing goes for editing. Depending on the isdrink value, some have to be uneditable.
	function editProduct() {

		let thisData = this;

		switch($(this).parent().find('.dataValue').data('value')) {

			case 0:
			case 1:
			$(this).parent().find('.nameValue').replaceWith(function() { return '<input type="text" value="' + $(this).text() + '">'; });
			$(this).parent().find(".dataValue").replaceWith('<select>' +
	    		'<option value="">Wählen</option>' +
	    		'<option value="0">Leihware</option>' +
	    		'<option value="1">Schnaps, Sekt, Wein</option>' +
	    		'<option value="2">Kastengetränk</option>' +
	    		'<option value="3">Getränk ohne Kasten</option>' +
	    		'</select>');
			$(this).parent().find('.pricesValue1').replaceWith(function() { return '<input type="number" value="' + $(this).text() + '">'; });
			break;

			case 2:
			$(this).parent().find('.nameValue').replaceWith(function() { return '<input type="text" value="' + $(this).text() + '">'; });
			$(this).parent().find(".dataValue").replaceWith('<select>' +
	    		'<option value="">Wählen</option>' +
	    		'<option value="0">Leihware</option>' +
	    		'<option value="1">Schnaps, Sekt, Wein</option>' +
	    		'<option value="2">Getränk ohne Kasten</option>' +
	    		'<option value="3">Kastengetränk</option>' +
	    		'</select>');
			$(this).parent().find('.pricesValue1').replaceWith(function() { return '<input type="number" value="' + $(this).text() + '">'; });
			$(this).parent().find('.lgValue').replaceWith(function() { return $('.leergutSelection').clone(); });
			break;


			case 3:
			$(this).parent().find('.nameValue').replaceWith(function() { return '<input type="text" value="' + $(this).text() + '">'; });
			$(this).parent().find(".dataValue").replaceWith('<select id="editDataValue">' +
	    		'<option value="">Wählen</option>' +
	    		'<option value="0">Leihware</option>' +
	    		'<option value="1">Schnaps, Sekt, Wein</option>' +
	    		'<option value="2">Kastengetränk</option>' +
	    		'<option value="3">Getränk ohne Kasten</option>' +
	    		'</select>');
			$(this).parent().find('.pricesValue1').replaceWith(function() { return '<input type="number" value="' + $(this).text() + '">'; });
			$(this).parent().find('.pricesValue2').replaceWith(function() { return '<input type="number" value="' + $(this).text() + '">'; });
			$(this).parent().find('.maxFlValue').replaceWith(function() { return '<input type="number" value="' + $(this).text() + '">'; });
			$(this).parent().find('.lgValue').replaceWith(function() { return $('.leergutSelection').clone(); });
			break;
		}

		$('#editDataValue').change(function() {

			editProduct();
			$('#editDataValue').off('change');
		});

		$(this).parent().find('.nameValue').replaceWith('<input type="text" value="' + $(this).text() + '">');

	    this.innerHTML = "✔";
	}
});