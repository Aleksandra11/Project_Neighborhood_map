var map;
var markers = [];
//var infowindow;

//Data Model
var places = [
        {
            name: 'Maymont Park',
            street: '1700 Hampton St',
            city: 'Richmond, VA 23220',
            phoneNum: '+1 804-358-7166',
			lat: 37.535977,
			lng: -77.47701,
            num: '0',
            url: 'www.maymont.org'
        },
        {
            name: 'Lewis Botanical Garden',
            street: '1800 Lakeside Ave',
            city: 'Henrico, VA 23228',
            phoneNum: '+1 804-262-9887',
            lat: 37.621371,
            lng: -77.4718362,
            num: '1',
            url: 'www.lewisginter.org'
        },
        {
            name: 'Water Country USA',
            street: '176 Water Country Pkwy',
            city: 'Williamsburg, VA 23185',
            phoneNum: '+1 757-229-9300',
			lat: 37.26206,
			lng: -76.63563,
            num: '2',
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
            url: 'www.seaworldparks.com/en/buschgardens-williamsburg/'
            //imgAttribution : 'http://www.flickr.com'
        },
        {
            name: 'Kings Dominion Theme Park',
            street: '16000 Theme Park Way',
            city: 'Doswell, VA 23047',
            phoneNum: '+1 804-876-5000',
            lat: 37.84194,
            lng: -77.44539,
            num: '4',
            url: 'www.kingsdominion.com'
        },
        {
            name: 'Washington Monument',
            street: '2 15th St NW',
            city: 'Washington, DC 20007',
            phoneNum: '+1 804-876-5000',
            lat: 38.889484,
            lng: -77.0363733,
            num: '5',
            url: 'www.kingsdominion.com'
        }
];


var viewModel = function() {
	var self = this;
	//create places and store them in the observable array
	self.allPlaces = [];
    //self.placeList = ko.observableArray([]);
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
    
    var mapOptions = {
        zoom: 9,
        center: {lat: 37.535977, lng: -77.47701}
    };
    
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    infowindow = new google.maps.InfoWindow();

    var Place = function(data){
        this.name = data.name;
        this.lat = data.lat;
        this.lng = data.lng;
        this.street = data.street;
        this.city = data.city;
        this.phoneNum = data.phoneNum;
        this.num = data.num;
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

        marker.contentString = '<img src="'+ streetViewURL +' '+ place.lat +','+ place.lng +'&heading=5" alt="Street view image"><br><hr style="margin-bottom: 5px"><strong>'+ place.name +'</strong><br><p>"blablabla"</p>';

        google.maps.event.addListener(marker,'click',(function(marker) {
            return function(){
                map.setCenter (marker.getPosition());
                map.setZoom(12);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){marker.setAnimation(null);}, 3500);
                infowindow.setContent(marker.contentString);// + "<div id='content'><br><p>' + </div>");
                infowindow.open(map,marker);
                //getFourSquare(marker);
            }
        })(marker));
        //place.marker = marker;
        markers.push(marker);
    });

    

    self.visiblePlaces = ko.observableArray([]);

    self.allPlaces.forEach(function(place){
        self.visiblePlaces.push(place);
    });
    /*
        
        marker.setMap(map);
        place.marker = null; //Make the marker an object of the place object
        self.placeList.push(place);
    */
    
        
        //self.mapMarkers.push(marker);

    function reset() {
        var windowSize = $(window).width();
        if(windowSize <= 1080) {
            map.setCenter(mapOptions.center);
            map.setZoom(10);
        } else { map.setCenter(mapOptions.center);
                map.setZoom(12);
            }
    }
    $("#resetMap").click(function(){
        reset();
    });
//};
    self.filter = ko.observable('');
    
    self.showInfo = function(place){
        var point = markers[place.num];
        center = point.getPosition();
        map.panTo(center);
        map.setZoom(14);
        infowindow.setContent(point.title);// + "<div id='content'><br><p>' + </div>");
        infowindow.open(map, point);
        point.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){point.setAnimation(null);}, 3500);
        
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
            if (place.name.toLowerCase().indexOf(searchWord) !== -1){
                self.visiblePlaces.push(place);
            }
        });
        self.visiblePlaces().forEach(function(place) {
            place.marker.setVisible(true);
        });
};
};
ko.applyBindings(new viewModel());


/*    self.filteredList = ko.computed(function() {
        var searchWord = self.filter().toLowerCase();
        self.visiblePlaces.removeAll();
        //var placeName = self.placeList();//.name.toLowerCase();
        //console.log(placeName);
        /*var namesArray = placeName.split(" ");
        var stringStartsWith = function() {
            for (var i = 0; i < namesArray.length; i++) {
                return placeName.substring(0, searchWord.length) === searchWord;
                return namesArray.substring(0, searchWord.length) === searchWord;
            }
        
        };
        if (!searchWord) {
            return self.placeList();
            self.mapMarkers(null);
        } else {
            self.placeList([]);
            for (var i=0; i < placeName.length; i++) {
                if (placeName[i].name.toLowerCase().indexOf(searchWord) != -1) {
                    self.mapMarkers().setMap(map);
                    self.placeList.push(placeName[i]);
                }
            }
        } /*{
            return ko.utils.arrayFilter(self.placeList(), function(place) {
                //return stringStartsWith(place.name.toLowerCase(), searchWord);
                return place.name.toLowerCase().indexOf(searchWord) !== -1;
                                
            });
        }
    }, self);*/
    /*self.filteredList.subscribe(function() {
        var diff = ko.utils.compareArrays(self.placeList(), self.filteredList());
        //var results = [];
        ko.utils.arrayForEach(diff, function(marker){
            if (marker.status !=="deleted") {
                //return self.mapMarkers();
                self.mapMarkers(null); //delete all markers
                //place.marker.setMap(null);
            }
            //else {
            //    return self.mapMarkers(null);//doesnt work
            //}
        });
        //return results;
    });*/
    //initMap();







/*    
    self.placeList.forEach(function(place) {
        self.visibleList.push(place);
    });

    self.filteredList = function() {
        var searchWord = self.filter().toLowerCase();
        self.placeList.removeAll();
        self.placeList.forEach(function(place) {
            place.marker.setVisible(false);
        
            if (place.name.toLowerCase().indexOf(searchWord) !== -1) {
                self.visibleList.push(place);
            }
        });
        self.visibleList().forEach(function(place) {
            place.marker.setVisible(true);
        });
    };
*/