/*
 * this file handles all casual events happen on /lieferscheinprogramm/index.php
 * When loading this page, the code seeks for the int "listFilter" which is used to get
 * the right list from backend. The lists are delivery notes with different states like
 * "done" or "undone".
 */
$(document).ready(function() {

	var dataFilter;

	switch(localStorage.getItem("listFilter")) {

		case "0":
		getLS(0);
		break;

		case "1":
		getLS(1);
		break;

		case "2":
		getLS(2);
		break;

		case "3":
		getLS(3);
		break;

		case "4":
		getLS(4);
		break;

		default:
		localStorage.setItem('listFilter', "0");
		getLS(0);
		break;
	}
	
	$('#filterButton').change(function() {
		
		switch($('#filterButton').val()) {

			case "0":
			localStorage.setItem('listFilter', "0");
			getLS(0);
			break;

			case "1":
			localStorage.setItem('listFilter', "1");
			getLS(1);
			break;

			case "2":
			localStorage.setItem('listFilter', "2");
			getLS(2);
			break;

			case "3":
			localStorage.setItem('listFilter', "3");
			getLS(3);
			break;

			case "4":
			localStorage.setItem('listFilter', "4");
			getLS(4);
			break;

			default:
			localStorage.setItem('listFilter', "0");
			getLS(0);
			break;
		}
	});

	function getLS(dataFilter) {

		whileLoading();
		
		$.ajax({
			url: '/Workers/lieferscheinprogramm/backEnd/getLS.php',
			data: {"dataFilter": dataFilter}, 
			type: 'post',
			dataType: 'JSON',
			success: function(data) {

				$('.dataList').empty();
				doneLoading();
		
				if(data.action == 1) {
					
					for (let i = 0; i < data.message.length; i++) {
					
						$('.dataList').append("<a data-id='" + data.message[i].id + "' href='lieferschein.php?id=" + data.message[i].id + "'>" + data.message[i].name + "<span class='stayRight'>" + data.message[i].datum + "</span></a>");
					}
				}else if(data.action == 0) {

					$('.dataList').html(data.message);
				}
			},
			error: function(xhr, status, error) {

  				console.log(xhr.responseText);
  				console.log(error);
			}
		});
	}
});