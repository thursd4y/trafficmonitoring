$( document ).ready(function() {
  $( "#submit" ).on("click", function( event ) {


    // Get some values from elements on the page:
      desc = $( "#name" ).val();
      lat = $( "#lat" ).val()*1;
      lng = $( "#lng" ).val()*1;
      time = $( "#timeloss" ).val()*1;
      risk = $( "#risk option:selected" ).val()*1;
      type = $( "#type option:selected" ).text();

      url = "https://nameless-river-26548.herokuapp.com/event";

    // Send the data using post
    var posting = $.post( url, { description: desc, type, risk, lat, lng, timeLoss : time});

    // Put the results in a div
    posting.done(function( data ) {
		loadEvent(data);
    });
  });

  var url = "https://nameless-river-26548.herokuapp.com";

  $( "#load" ).on("click", function(){
	 var nr = $( "#route option:selected" ).val()*1;

	 var sLat;
	 var sLng;
	 var eLat;
	 var eLng;

	  if(nr == 1){
	  	sLat = 48.29;
	  	sLng = 14.28;
	  	eLat = 48.24;
	  	eLng = 14.63;
	  } else if(nr == 2){
		  sLat = 48.39;
		  sLng = 14.08;
		  eLat = 48.11;
		  eLng = 14.56;
	  } else if(nr == 3){
		  sLat = 48.35;
		  sLng = 14.42;
		  eLat = 48.27;
		  eLng = 13.73;
	  }

      $.get(url + `/route?sLat=${sLat}&sLng=${sLng}&eLat=${eLat}&eLng=${eLng}`, function(data){
        loadRoute(data);
      });
    });


	$( "#report" ).on("click", function(){

		let startDate = $("#startDate").val();
		let endDate = $("#endDate").val();


		$.get(url + `/report?startDate=${startDate}&endDate=${endDate}`, function(data){
			loadReport(data);
		});
	});
});
