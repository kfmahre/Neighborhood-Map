# Neighborhood-Map
OK, This is my version of Udacity's FEND Project-5: Neighborhood Map Project, & a walk-through on how I went about getting through all the requirements.

## First few steps:

First I created 5 location objects in a model array similar to in the cat clicker app, only instead of images of cats, I added a url to maps I made of trails I've gone running on:
```bash
var initialTrails = [
      {
    name: "Kennesaw Mountain Trail",
    address: "900 Kennesaw Mountain Dr, Kennesaw Georgia",
    description: "Run or hike this 2.4 mile round-trip trail to climb Kennesaw Mountain. Depending on your fitness level and how fast you attempt to get to the top, this trail can vary in difficulty. This trail is heavy volume, so expect a crowd on a nice day!",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zZORWFp4Wxqg.kAyWKntuuMJ4&hl=en",
    lat: "33.98363",
    lng: "-84.57836"
      },
```

Then I took the ViewModel from the Cat-clicker KO app and adapted it for use with this new app. No sense in reineventing the wheel again:

```bash
var ViewModel = function() {
  var self = this;

  this.trailList = ko.observableArray([]);

  initialTrails.forEach(function(trailItem){
    self.trailList.push(new Trail(trailItem));
  });

  this.currentTrail = ko.observable(self.trailList()[0]);

  this.trails = ko.observableArray(initialTrails);

  this.selectTrail = function(selectedTrail) {
    self.currentTrail(selectedTrail);
  };
  ```

```bash
var Trail = function(data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.description = ko.observable(data.description);
  this.trailMapUrl = ko.observable(data.trailMapUrl);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
};
```
  
  One of the requirements is to have a map with markers. We already did a project with a functioning google map with markers, the interactive resume project. I took the code from that project and adapted it to fit into my new app:
  
  ```bash
  var initializeMap = function() {

  var googleMap = '<div id="map"></div>';
  $("#mapDiv").append(googleMap);
  //var map;    // declares a global map variable
  var locations;

  var mapOptions = {
    //zoom: 18,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.querySelector('#map'), mapOptions);

  var locationFinder = function() {

    var locations = [];

    for (i = 0; i < initialTrails.length; i++) {
    //var latLng = new google.maps.LatLng(initialTrails[i].lat, initialTrails[i].lng);
    locations.push(initialTrails[i].address);
    //locations.push(initialTrails[i].name);
  };
    return locations;
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
   var createMapMarker = function(placeData) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: Trail.name
    });

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.open(map, marker);
    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
   var callback = function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  };

  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */

  var pinPoster = function(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    for (var place in locations) {

      // the search request object
      var request = {
        query: locations[place]
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }


  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  locations = locationFinder();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}

window.addEventListener('load', initializeMap);

window.addEventListener('resize', function(e) {
map.fitBounds(mapBounds);
});
```
Next, I added in part of the ajax mini-course for later development:

```bash
// Wiki Ajax

var loadData = function(marker) {
    var $wikiElem = $('#wikipedia-links');
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+city+'&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("failed to get Wikipedia resources");
    }, 8000);

    $.ajax(wikiURL, {
        //url: wikiURL,
        dataType: "jsonp",
        // jsonp: "callback",
        success: function(response) {
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="'+url+'">'+articleStr+'</a></li>');
            };
            clearTimeout(wikiRequestTimeout);
        }
    });
};
```

Then I added bootstrap; some styles and some knockout bindings to my html to end up with this:

picture
picture

So far I had the whole frame of the site set up. There is a goggle map with markers pinned on my locations. There is listview of my model that changes the view with the bindings I've got set up with KO. There is a searchbar with no functionality. I've got the skeleton of a wiki Ajax request in my app.js file. 

TODO from this point: Get the markers to bind with the listview... 1. Make it so when a trail marker is selected it selects a trail. 2. Make the marker change colors or bounce when it is selected. 3. Add searchbar functionality.

