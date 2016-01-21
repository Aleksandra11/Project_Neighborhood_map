var map;
var markers = [];

//Data Model
//To use GoogleStreetView Images for each place we need heading property stored in headImage parameter
var places = [
        {
            name: 'Maymont Park',
            street: '1700 Hampton St',
            city: 'Richmond, VA 23220',
			lat: 37.535977,
			lng: -77.47701,
            num: '0',
            headImage: 5
        },
        {
            name: 'Lewis Botanical Garden',
            street: '1800 Lakeside Ave',
            city: 'Henrico, VA 23228',
            lat: 37.621371,
            lng: -77.4718362,
            num: '1',
            headImage: 5
        },
        {
            name: 'Browns Island',
            street: '500 Tredegar St',
            city: ' Richmond, VA 23219',
            lat: 37.53512,
            lng: -77.44490,
            num: '2',
            headImage: 200
        },
        {
            name: 'Water Country USA',
            street: '176 Water Country Pkwy',
            city: 'Williamsburg, VA 23185',
			lat: 37.2622651,//&fov=75&heading=310
			lng: -76.6351946,
            num: '3',
            headImage: 310
        },
        {
            name: 'Busch Gardens Theme Park',
            street: '1 Busch Gardens Boulevard',
            city: 'Williamsburg, VA 23185',
            lat: 37.2330126,
            lng: -76.6467928,
            num: '4',
            headImage: 5
        },
        {
            name: 'Kings Dominion Theme Park',
            street: '16000 Theme Park Way',
            city: 'Doswell, VA 23047',
            lat: 37.841824,
            lng: -77.4442598,
            num: '5',
            headImage: 150
        },
        {
            name: 'Great Wolf Lodge',
            street: '549 E Rochambeau Dr',
            city: 'Williamsburg, VA 23188',
            lat: 37.3498831,
            lng: -76.7290981,
            num: '6',
            headImage: 200
        },
        {
            name: 'Metro Richmond Zoo',
            street: '8300 Beaver Bridge Rd',
            city: 'Moseley, VA 23120',
            lat: 37.3878451,
            lng: -77.7638278,
            num: '7',
            headImage: 189
        }
];

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

function initMap() {
//Build the Google Map object
    var mapOptions = {
        zoom: 9,
        center: {lat: 37.535977, lng: -77.47701},
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

//Reset map on click handler
    function reset() {
        var windowSize = $(window).width();
        if(windowSize <= 1080) {
            map.setCenter(mapOptions.center);
            map.setZoom(8);
        }if (windowSize <= 600) {
            map.panBy(40, 0);
            map.setZoom(9);
        }else {
            map.setCenter(mapOptions.center);
            map.setZoom(10);
            map.panBy(100, 0);
            }
    }
//Center the map while resizing
    $(window).resize(function() {
        reset();
    });

    $("#resetMap").click(function(){
        reset();
    });

    ko.applyBindings(new viewModel());
}

//Error handling: if the browser has trouble to load google map, display error message
function gError() {
    alert("Sorry, something wrong loading Google Maps. Please try reload your page.");
}

var viewModel = function() {
	var self = this;
	self.allPlaces = [];//stores all places in the array
    self.foursquare = '';
    self.toggleSign = ko.observable('hide');//holds value for toggling the list view
    self.lightboxUrl = ko.observable('');//stores photo URL from flickr
    self.flickrArray = ko.observableArray([]);//array of flickr photos
    self.lightboxVisible = ko.observable(false);
    self.nextArrowVisible = ko.observable(true);
    self.prevArrowVisible = ko.observable(true);
    self.filter = ko.observable('');//stores the user input in search box
	//self.mapMarkers = ko.observableArray([]); //holds all map markers
    self.changeTitle = ko.observable('Fun Parks near Richmond, VA');

    infowindow = new google.maps.InfoWindow();

//Constructor function for "Place" objects, which takes the original data
    var Place = function(data){
        this.name = data.name;
        this.lat = data.lat;
        this.lng = data.lng;
        this.street = data.street;
        this.city = data.city;
        this.num = data.num;
        this.headImage = data.headImage;
    };
//Create places and store them in the array
    places.forEach(function(place) {
        self.allPlaces.push(new Place(place));
    });

//Use Google's Map API to get Google Street View images for each individual marker's infowindow
    var streetViewURL = 'http://maps.googleapis.com/maps/api/streetview?size=200x100&location=';
    
//Create and place Markers on the map with individual info windows based on data from FourSquare API
    self.allPlaces.forEach(function(place) {
        //var image = new google.maps.MarkerImage('marker' + markerNum + '.png');
        place.marker = new google.maps.Marker({
            position: new google.maps.LatLng(place.lat, place.lng),
            map: map,
            title: place.name,
            label: labels[labelIndex++ % labels.length],
            //icon: image,
            animation: google.maps.Animation.DROP
        });
        var marker = place.marker;
        
        marker.contentString = '<div class="iw-title">'+ place.name +'</div><br><img src="'+ streetViewURL +' '+ place.lat +','+ place.lng +'&heading='+ place.headImage +'" alt="Street view image"><br><hr style="margin-bottom: 2px; border-color: #48b5e9"><br>';

//Adds "click" listeners onto the marker with bouncing animation and infowindow
        google.maps.event.addListener(marker,'click',(function(marker) {
            return function(){
                map.setCenter (marker.getPosition());
                map.setZoom(11);
                map.panBy(0, -140);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){marker.setAnimation(null);}, 1400);
                infowindow.setContent(marker.contentString + "<div id='content'></div>");// + "<div id='content'><br><p>' + </div>");
                infowindow.open(map,marker);
                getFourSquare(marker);
                if ($(window).width() > 499 && $(window).width() <= 600) {
                    self.changeTitle('');
                }
                if ($(window).width() <= 600) {
                    self.mobileShow(false);
                    map.panBy(0, -260);
                } else {
                    self.mobileShow(true);
                }
            };
        })(marker));
        //Store markers in the markers array
        markers.push(marker);
    });
//This array will hold only the places that should be visible on the map
    self.visiblePlaces = ko.observableArray([]);
    self.allPlaces.forEach(function(place){
        self.visiblePlaces.push(place);
    });

//Function that manages toggling of the list view and centering on mobile devoces.
    checkWindow();

//Hide the list when the window size less than 500px
    function checkWindow() {
        if ($(window).width() <= 499) {
            self.toggleSign('show');
            map.panBy(80, -40);
            map.setZoom(8);
        } else {
            self.toggleSign('hide');
        }
        infowindow.close();
        //self.filter('');
    }

//Control the list while resizing
    $(window).resize(function() {
        checkWindow();
    });
    $("#resetMap").click(function(){
        checkWindow();
    });

//Event that closes the Info Window with a click on map
    google.maps.event.addDomListener(map, 'click', function() {
        infowindow.close();
    });

//Toggle the list menu with "hide" and "show" options
    self.listToggle = function() {
        if(self.toggleSign() ==='hide'){
            $(".list").slideUp(500);
            self.toggleSign('show');
        } else {
            self.toggleSign('hide');
            $(".list").slideDown(1500);
        }
    };
     
    //or use keyboard shortcuts (keyCode property (dot button)) to toggle the list menu
    $(document).keypress(function(event) {
        console.log( "Handler for .keypress() called." );
        var togg = event.which || event.keyCode; //For a cross-browser solution
        if (togg === 46){
            self.listToggle();
        }
    });

    //Create a touch point to toggle the list menu
    addEventListener('touchstart', function(event){
        var touch = event.touches[0];
        if (event.touches.length == 2){
            self.listToggle();
        }
    }, false);

    self.mobileShow = ko.observable(true);
    self.toggleSearch = function() {
        if(self.mobileShow() === true) {
            self.mobileShow(false);
        } else {
            self.mobileShow(true);
        }
    };
//Show infowindow when click on the place from list
    self.showInfo = function(place){
        var point = markers[place.num];
        center = point.getPosition();
        map.panTo(center);
        map.setZoom(12);
        map.panBy(0, -140);
        infowindow.setContent(point.contentString + "<div id='content'></div>");
        infowindow.open(map, point);
        point.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            point.setAnimation(null);
        }, 1400);
        getFourSquare(point);
        //Hide the list on small size screen when infowindow is open
        if ($(window).width() <= 499) {
            self.toggleSign('show');
            self.mobileShow(false);
            map.panBy(0, -260);
        } else {
            self.toggleSign('hide');
            self.mobileShow(true);
        }
        if ($(window).width() > 499 && $(window).width() <= 600) {
            self.mobileShow(false);
            map.panBy(0, -260);
            self.changeTitle('');
        }
    };

//Additional functionality using Flickr API's to include Flickr Photos
    self.getFlickr = function(place) {
        infowindow.close();
        var pic = markers[place.num];
        var lat = pic.position.lat();
        var lng = pic.position.lng();
        var tags = pic.title.replace('','+');
        var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ab6138e7d8f72cd69cf0281e1a2df48e&text=' + tags +'&accuracy=11&content_type=1&lat='+lat+'&lon='+ lng +'&per_page=20&format=json&nojsoncallback=1';

//Asynchronous Flickr data request in JSON format
//Allerting the message to notify the user in case of error
        $.getJSON(flickrUrl)
         .done(function(data) {
            console.log(data);
            resultsFlicker(data);
            self.lightboxUrl(self.flickrArray()[0]);
            self.lightboxVisible(true);
         })
         .fail(function(jqxhr, textStatus, error) {
            alert("Sorry, Flickr photos can't be loaded. A ninja ruined this page.");
         });
        self.changeTitle(pic.title);
    };

//Create photo Url from flickr data and store it in the flickrArray
    function resultsFlicker(data) {
        ko.utils.arrayForEach(data.photos.photo, function(photo) {
            var photoUrl = 'https://farm' + photo.farm +'.staticflickr.com/'+ photo.server +'/'+ photo.id + '_'+ photo.secret + '.jpg';
            self.flickrArray.push(photoUrl);
        });
    }

// Close the lightbox
    self.closeLightbox = function() {
        self.flickrArray.removeAll();
        self.lightboxVisible(false);
        self.lightboxUrl('');
        self.changeTitle('Fun Parks near Richmond, VA');
    };

  /** Choose the previous or next photo in the currentPhotos array to be displayed when the
    * right/left arrow or right/left side of the photo is clicked. If at the end of the currentPhotos array, the
    * following photo will loop to the start of the array
    */
  self.nextPhoto = function() {
    var i = self.flickrArray.indexOf(self.lightboxUrl());
    if(i !== self.flickrArray().length-1){
      self.lightboxUrl(self.flickrArray()[i+1]);
    }else{
      self.lightboxUrl(self.flickrArray()[0]);
    }
  };

  self.prevPhoto = function() {
    var i = self.flickrArray.indexOf(self.lightboxUrl());
    if(i !== 0) {
      self.lightboxUrl(self.flickrArray()[i-1]);
    }else{
      self.lightboxUrl(self.flickrArray()[self.flickrArray().length-1]);
    }
  };

//Function that allows user to filter the list of places by name
//Compares search word against names and return a filtered list and the markers on the map
    
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
        });
        if ($(window).width() <= 499) {
            self.toggleSign('hide');
        }
    };

//To show the unique information about a location in an infowindow for each marker from FourSquare API
    var getFourSquare = function(marker) {
        var clientId = 'YAOT3CZXVKIYJM2CJLEOVDANHL3SO200P1DWZIDT0N4QRU4U';
        var clientSecret = 'UVBDIAE0XG34OAKIKNLN50GTMW1HOTKPR4TD5I4VD5W2UR0P';
        var lat = marker.position.lat();
        var lng = marker.position.lng();
        var $fsContent = $('#content');
    //Create search URL using marker title as text search and marker position for lat/lng
        var fsURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20151005' + '&ll=' +lat+ ',' +lng+ '&query=\'' +marker.title +'\'&limit=1';
    //Use async call to get foursquare data in JSON format.
        $.getJSON(fsURL, function(response){
            var venue = response.response.venues[0];

            var venueUrl = venue.url;
            if(venueUrl !== null && venueUrl !== undefined){
                $fsContent.append('<p><strong>Website: </strong><a href=' + venueUrl + '>'+venueUrl+'</a></p>');
            } else {$fsContent.append('<p>URL: Not found</p>');}

            var twitterId = venue.contact.twitter;
            if(twitterId !== null && twitterId !== undefined){
                $fsContent.append('<p><strong>Twitter: </strong>@'+twitterId+'</p>');
            } else {$fsContent.append('<p>Twitter: Not found</p>');}

            var phone = venue.contact.formattedPhone;
            if(phone){
                $fsContent.append('<p><strong>Phone: </strong>' + phone +'</p>');
            } else {$fsContent.append('<p>Phone: Not found</p>');}

            var address = venue.location.formattedAddress;
            if(address !== null && address !== undefined){
                $fsContent.append('<p>'+address+'</p>');
            } else {$fsContent.append('<p>Address: Not found</p>');}

            }).error(function(e){
                $fsContent.text('FourSquare results failed to load');
                return false;
            });
    };
};