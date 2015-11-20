var map;
var markers = [];
//var infowindow;

//Data Model
//To use GoogleStreetView Images for each place we need heading property stored in headImage parameter
var places = [
        {
            name: 'Maymont Park',
            street: '1700 Hampton St',
            city: 'Richmond, VA 23220',
            phoneNum: '+1 804-358-7166',
			lat: 37.535977,
			lng: -77.47701,
            num: '0',
            headImage: 5
        },
        {
            name: 'Lewis Botanical Garden',
            street: '1800 Lakeside Ave',
            city: 'Henrico, VA 23228',
            phoneNum: '+1 804-262-9887',
            lat: 37.621371,
            lng: -77.4718362,
            num: '1',
            headImage: 5,
            url: 'www.lewisginter.org'
        },
        {
            name: 'Water Country USA',
            street: '176 Water Country Pkwy',
            city: 'Williamsburg, VA 23185',
            phoneNum: '+1 757-229-9300',
			lat: 37.2622651,//&fov=75&heading=310
			lng: -76.6351946,
            num: '2',
            headImage: 310,
            url: 'www.watercountryusa.com'
            //imgAttribution : 'http://www.flickr.com'
        },
        {
            name: 'Busch Gardens Theme Park',
            street: '1 Busch Gardens Boulevard',
            city: 'Williamsburg, VA 23185',
            phoneNum: '+1 800-343-7946',
            lat: 37.2330126,
            lng: -76.6467928,
            num: '3',
            headImage: 5
            //imgAttribution : 'http://www.flickr.com'
        },
        {
            name: 'Kings Dominion Theme Park',
            street: '16000 Theme Park Way',
            city: 'Doswell, VA 23047',
            phoneNum: '+1 804-876-5000',
            lat: 37.841824,
            lng: -77.4442598,
            num: '4',
            headImage: 150
        },
        {
            name: 'Great Wolf Lodge',
            street: '549 E Rochambeau Dr',
            city: 'Williamsburg, VA 23188',
            phoneNum: '+1 804-876-5000',
            lat: 37.3498831,
            lng: -76.7290981,
            num: '5',
            headImage: 200
        }
];


var viewModel = function() {
	var self = this;
	//create places and store them in the observable array
	self.allPlaces = [];
    self.foursquare = '';
    self.toggleSign = ko.observable('hide');
    //self.filteredList = ko.observableArray([]);
    //self.filter = ko.observable('');    //user input in search box
	//self.mapMarkers = ko.observableArray([]); //holds all map markers
    //loop over all our initialMarkers and for each one put it into the placeList
	//places.forEach(function(place)
	//	self.placeList.push(new initMap(place));
	//});
    //self.placeList.push(new initMap(place));
    //google.maps.event.addDomListener(window, 'load', initMap);
//var initMap = function() {
    self.mapRequestTimeout = setTimeout(function() {
        alert("Sorry, something wrong loading Google Maps. Please try reload your page.");
  }, 5000);

    var mapOptions = {
        zoom: 9,
        center: {lat: 37.535977, lng: -77.47701}
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    clearTimeout(self.mapRequestTimeout);

    infowindow = new google.maps.InfoWindow();

    var Place = function(data){
        this.name = data.name;
        this.lat = data.lat;
        this.lng = data.lng;
        this.street = data.street;
        this.city = data.city;
        this.phoneNum = data.phoneNum;
        this.num = data.num;
        this.headImage = data.headImage;
        this.marker = null;
    };

    places.forEach(function(place) {
        self.allPlaces.push(new Place(place));
    });

    var streetViewURL = 'http://maps.googleapis.com/maps/api/streetview?size=180x90&location=';

    self.allPlaces.forEach(function(place) {
        //for (var i = 0; i < places.length; i++){
    //    var place = places[i];
    //    place.isVisible = ko.observable(true);
        place.marker = new google.maps.Marker({
            position: new google.maps.LatLng(place.lat, place.lng),
            map: map,
            title: place.name,
            animation: google.maps.Animation.DROP
        });
        var marker = place.marker;
        
        marker.contentString = '<img src="'+ streetViewURL +' '+ place.lat +','+ place.lng +'&heading='+ place.headImage +'" alt="Street view image"><br><hr style="margin-bottom: 5px"><strong>'+ place.name +'</strong><br>';

        google.maps.event.addListener(marker,'click',(function(marker) {
            return function(){
                map.setCenter (marker.getPosition());
                map.setZoom(12);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){marker.setAnimation(null);}, 3500);
                infowindow.setContent(marker.contentString + "<div id='content'></div>");// + "<div id='content'><br><p>' + </div>");
                infowindow.open(map,marker);
                getFourSquare(marker);                
            }
        })(marker));
        //place.marker = marker;
        markers.push(marker);

    }); 

    self.visiblePlaces = ko.observableArray([]);

    self.allPlaces.forEach(function(place){
        self.visiblePlaces.push(place);
    });
    
    function reset() {
        var windowSize = $(window).width();
        if(windowSize <= 1080) {
            map.setCenter(mapOptions.center);
            map.setZoom(9);
        } else { map.setCenter(mapOptions.center);
                map.setZoom(10);
            }
    }
    //Center the map while resizing
    $(window).resize(function() {
        reset();
    });
    $("#resetMap").click(function(){
        reset();
    });
    //Close infowindow when clicked on map
    google.maps.event.addDomListener(map, 'click', function() {
        infowindow.close();
    });

    //Toggle the list menu with "hide" and "show" options
    self.listToggle = function() {
        if(self.toggleSign() ==='hide'){
            self.toggleSign('show');
            //$("#list").toggleClass('hidden');
        } else {
            self.toggleSign('hide');
            //$("#list").toggleClass('hidden');
        }
    };
    // 
    //or use keyCode property to toggle the list menu
    $(document).keypress(function(event) {
        console.log( "Handler for .keypress() called." );
        var space = event.which || event.keyCode; //For a cross-browser solution
        //(event.keyCode ? event.keyCode : event.which);
        if (space === 32){
            //$("#list").toggleClass('hidden');
            self.listToggle();
        }
    });

    //Create a touch point to toggle the list menu
    addEventListener('touchstart', function(event){
        var touch = event.touches[0];
        if ( event.touches.length == 2){
            //$("#list").toggleClass('hidden');
            self.listToggle();
        }
    }, false);


    self.filter = ko.observable('');
    
    self.showInfo = function(place){
        var point = markers[place.num];
        center = point.getPosition();
        map.panTo(center);
        map.setZoom(12);
        infowindow.setContent(point.title);// + "<div id='content'><br><p>' + </div>");
        infowindow.open(map, point);
        point.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            point.setAnimation(null);
        }, 3500);
        
    };
    
/*
    self.mapMarkers = function(state) {
        for (var i=0; i < markers.length; i++) {
            markers[i].setMap(state);
        }
    }
    */
    //self.currentPlace = ko.observable(self.placeList()[0]);
    /*self.showInfo = function(clickedPlace){
        console.log('hi');
		self.currentPlace(clickedPlace);
        return function(){
                map.setCenter (currentPlace.getPosition());
                map.setZoom(12);
                
	    };
    };*/
    //create a computed observable that returns the matching subsetof the original array of places
    //allow user to filter the list of places by name
    

self.filterMarkers = function() {
        var searchWord = self.filter().toLowerCase();
        
        self.visiblePlaces.removeAll();
        self.allPlaces.forEach(function(place) {
            place.marker.setVisible(false);
            infowindow.close();
            if (place.name.toLowerCase().indexOf(searchWord) !== -1){
                self.visiblePlaces.push(place);
            }
        });
        self.visiblePlaces().forEach(function(place) {
            place.marker.setVisible(true);
            //self.showInfo(place);
            
        });
};


        var getFourSquare = function(marker) {
            var clientId = 'YAOT3CZXVKIYJM2CJLEOVDANHL3SO200P1DWZIDT0N4QRU4U';
            var clientSecret = 'UVBDIAE0XG34OAKIKNLN50GTMW1HOTKPR4TD5I4VD5W2UR0P';
            var lat = marker.position.lat();
            var lng = marker.position.lng();
            var $fsContent = $('#content');
            //Create search URL using marker title as text search and marker position for lat/lng
            //var fsURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20150321' + '&ll=' +lat+ ',' +lng+ '&query=\'' +point.name +'\'&limit=1';
            var fsURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20151005' + '&ll=' +lat+ ',' +lng+ '&query=\'' +marker.title +'\'&limit=1';
            //Use async call to get foursquare data in JSON format.
            $.getJSON(fsURL, function(response){
                
                var venue = response.response.venues[0];

                var phone = venue.contact.formattedPhone;
                //$fsContent.append('<p>Phone:' + phone +'</p>');
                    if(phone){//(phone != null && phone != undefined){
                        $fsContent.append('<p><strong>Phone: </strong>' + phone +'</p>');
                    } else {$fsContent.append('<p>Phone: Not found</p>')}
                
                var twitterId = venue.contact.twitter;
                    if(twitterId != null && twitterId != undefined){
                        $fsContent.append('<p><strong>Twitter: </strong>@'+twitterId+'</p>');
                    } else {$fsContent.append('<p>Twitter: Not found</p>')}
                var venueUrl = venue.url;
                if(venueUrl != null && venueUrl != undefined){
                    $fsContent.append('<p><strong>Park Blogs: </strong><a href=' + venueUrl + '>'+venueUrl+'</a></p>');
                    } else {$fsContent.append('<p>URL: Not found</p>')}
                
       
            }).error(function(e){
                $fsContent.text('FourSquare results failed to load');
                return false;
            });

        };
};
ko.applyBindings(new viewModel());

