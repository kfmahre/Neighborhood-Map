// Initial list of locations, in my project I chose trailhead locations.
var initialTrails = [
      {
    name: "Kennesaw Mountain Trail",
    address: "900 Kennesaw Mountain Dr, Kennesaw Georgia",
    description: "Run or hike this 2.4 mile round-trip trail to climb Kennesaw Mountain. Depending on your fitness level and how fast you attempt to get to the top, this trail can vary in difficulty. This trail is heavy volume, so expect a crowd on a nice day!",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zZORWFp4Wxqg.kAyWKntuuMJ4&hl=en",
    generalLoc: "Kennesaw Mountain National Battlefield Park",
    lat: "33.98363",
    lng: "-84.57836"
      },
      {
    name: "Kennesaw Mountain Dr Road-Run",
    address: "900 Kennesaw Mountain Dr, Kennesaw Georgia",
    description: "This course is a real challenge and completing it is a huge confidence builder! This run is all uphill up a mountain road for the first half, and then back downhill for the second half. There are some very sightworthy views from the road under certian conditions.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.k2ExBAbfkAX0&hl=en",
    generalLoc: "Kennesaw Mountain National Battlefield Park",
    lat: "33.98515",
    lng: "-84.58278"
      },
      {
    name: "Noses Creek Trail",
    address: "1520 Burnt Hickory Rd NW, Marietta, GA 30064",
    description: "This trail starts and ends at two parking lots and is about three miles long. I like to park at one of the areas and then run to the other, then turn back the same way. It makes for a pretty easy and peaceful 6 mile round trip on a hot day in Georgia, as most of the way is under thick trees.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.k1XcH0DRGg5o&hl=en",
    generalLoc: "Noses Creek",
    lat: "33.96342",
    lng: "-84.59376"
      },
      {
    name: "Noonday Creek Trail",
    address: "3009 Bells Ferry Rd NE Marietta, Georgia",
    description: "This trail is good for bikers and runners who are looking to train on a flat and gradually sloped pathway. If you are looking for road running away or off of roads, this trail is paved, but it is not beside a road. The path I usually take only requires crossing one road; however, it is possible to take the trail all the way to adjoining trails at Kennesaw National Battlefield Park.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.kI1WmdKvbRTU&hl=en",
    generalLoc: "Noonday Creek",
    lat: "34.02328",
    lng: "-84.54868"
      },
      {
    name: "Red Top Mountain State Park",
    address: "659 Red Top Mountain Rd SE, Acworth, GA 30121",
    description: "",
    generalLoc: "Red Top Mountain",
    trailMapUrl: "",
    lat: "34.1546",
    lng: "-84.70299"
      },
      {
    name: "Silver Comet Trail",
    address: "4573 Mavell Rd, Smyrna, GA 30008",
    description: "No cars. Few hills. And mile after blissful mile of paved, smooth trail that just begs for a long-distance workout. The Silver Comet Trail is one of Georgia’s top trails for running, walking, cycling, or skating. It’s an epic-length, 61.5 mile trail that spans from the Atlanta suburbs in Symrna to the Alabama border. The rail trail follows the former corridor of the Silver Comet, an upscale passenger railway that ran through this scenic swath of Georgia landscape in the midcentury 1900s.",
    generalLoc: "Silver Comet Trail",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=z020aeEbhAZU.kf-qc7HOg6Bw",
    lat: "33.842162",
    lng: "-84.517838"
      }
      ];

// So we can talk about the map a bunch before I call it - made global.
var map;
var infowindow;

// Array for marker objects
var markers = [];

// Trail class - for telling the vM what to do when the trail is changed
var Trail = function(data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.description = ko.observable(data.description);
  this.trailMapUrl = ko.observable(data.trailMapUrl);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
};

// Start of ViewModel
var ViewModel = function() {

  var self = this;

  // Takes the value of the initial trails copies them into viewModel.trails
  self.trails = ko.observableArray(initialTrails.slice());

  // Input of the search
  self.query = ko.observable('');

  // Search filter function -  Thanks to Brandon Keepers for the info @
  // http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
  self.search = function(value) {
    // Closes an infowindow if one is open:
    infowindow.close();
    // Empties list:
    self.trails.removeAll();

    if self.search('') {
      var newCenter = new google.maps.LatLng(mapCenterLat, mapCenterLng);
      map.panTo(newCenter);
      map.setZoom(10);
    }

      // If the name of an initialTrails item matches
      // the value of what calls this function
      for (var x in initialTrails) {
        if (initialTrails.hasOwnProperty(x)) {
          if (initialTrails[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            self.trails.push(initialTrails[x]); // Put that trail back in the list
          }
        }
      }

      for (var i = 0; i < markers.length; i++) {
        // Take away all the markers:
        markers[i].setVisible(false);
        // Put back some:
        if (markers[i].name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
          markers[i].setVisible(true);
        }
      }
    };

  // Sets the current trail - just as we set a current cat in the Cat-Clicker project
  self.currentTrail = ko.observable(self.trails()[0]);

  // When a trail list item is clicked, we go through the index of markers and
  // if it's name matches the selected trail's name
  self.selectTrail = function(selectedTrail) {

    for (var i = 0; i < markers.length; i++) {
      if (selectedTrail.name == markers[i].name) {
        clickMarker(i);// the function passes it's index item to a function
      }
    }
  }.bind(this);

  // Simple click trigger function to activate a marker, used by above selectTrail
  var clickMarker = function(pickMe) {
    google.maps.event.trigger(markers[pickMe], 'click');
  };

  // Tells the map how to tay the markers
  self.layMarkers = function() {

    infowindow = new google.maps.InfoWindow();

    // For each initialTrail
    initialTrails.forEach(function(trail){
      // Make a new marker with these attributes
      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(trail.lat, trail.lng),
        title: trail.name,
        clickable: true,
        animation: google.maps.Animation.DROP,
        });
      marker.name = trail.name;
      // Move those objects into marker array
      markers.push(marker);

      // Clicking a marker sets that trail as the current trail
      google.maps.event.addListener(marker, 'click', function () {
        self.currentTrail(trail);
        self.query(trail.name); // Makes the list respond to marker clicks
        toggleBounce();
        getWiki();
        getWeather();
        infowindow.open(map, marker);
        var newCenter = new google.maps.LatLng(trail.lat, trail.lng);
        map.panTo(newCenter);
        map.setZoom(11);
        });

      google.maps.event.addListener(infowindow,'closeclick',function(){
        self.query('');
        var newCenter = new google.maps.LatLng(mapCenterLat, mapCenterLng);
        map.panTo(newCenter);
        map.setZoom(10);
      }); // Added this to reset the list when a infowindow is closed

      // Called by a marker click
      function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE); // Calls bounce
            stopAnimation(marker); // Timeout function on the bounce
          }
        }

      // Simple timeout function to stop the bounce animation of the markers
      function stopAnimation(marker) {
        setTimeout(function(){
          marker.setAnimation(null);
          }, 2200);
        }

      // Variables to reset the display of data within the marker infowindows
      var wikipediaHTML = '';
      var everything = '';

      // Wikipedia AJAX call
      var getWiki = function(marker) {
        infowindow.setContent("");
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&lim'+
        'it=1&search='+trail.generalLoc+'&format=json&callback=wikiCallback';

        // Error handler if wikipedia data can't be obtained - simple timeout
        var wikiRequestTimeout = setTimeout(function() {
          wikipediaHTML = '<div><p>Wikipedia Could Not be Loaded</p></div>';
          infowindow.setContent("<div id='infoWindow'><b>"+trail.name+"</b><br>"+
            trail.address+"<br><b>Wikipedia on Location:</b><br>"+wikipediaHTML+
            "</div>"+everything); // Error handler
        }, 2200);

        $.ajax({
          url: wikiUrl,
          dataType: "jsonp",
          success: function(response) {
            var wikiTitle = response[1];

            var url = 'http://en.wikipedia.org/wiki/' + wikiTitle;
            wikipediaHTML = '<li><a href="'+url+'"target="_blank">'+wikiTitle+
            '</a></li>';

            infowindow.setContent("<div id='infoWindow'><b>"+trail.name+
              "</b><br>"+trail.address+"<br><b>Wikipedia on Location:</b><br>"+
              wikipediaHTML+"</div>"+everything);

            clearTimeout(wikiRequestTimeout); // Calls timeout for error handler
            }
          });
      };
      // Weather Underground AJAX call
      var getWeather = function(marker) {
        var wUndergroundKey = "ee01f3177beaf4c5";
        var wUndergroundUrl = "http://api.wunderground.com/api/"+wUndergroundKey+
        "/conditions/q/"+trail.lat+","+trail.lng+".json";

        var current_weather = '';
        var temp = '';

        // Error handler if wUnderground data can't be obtained - simple timeout
        var wUndergroundTimeout = setTimeout(function() {
          everything = '<div><p>Weather Could Not be Loaded</p></div>';
          infowindow.setContent("<div id='infoWindow'><b>"+trail.name+"</b><br>"+
            trail.address+"<br><b>Wikipedia on Location:</b><br>"+wikipediaHTML+
            "</div>"+everything); // Error handler
        }, 2200);

        $.getJSON(wUndergroundUrl, function(data) {
          current_weather = data.current_observation.weather;
          temp = data.current_observation.temp_f;

          everything = "<div><b>Current weather:</b><br>"+current_weather+", "+
          temp+" F</div>";

          infowindow.setContent("<div id='infoWindow'><b>"+trail.name+"</b><br>"+
            trail.address+"<br><b>Wikipedia on Location:</b><br>"+wikipediaHTML+
            "</div>"+everything);

          clearTimeout(wUndergroundTimeout); // Calls timeout for error handler
        });
      };
    });
};

}; // End of ViewModel

// viewM is a new instance of viewModel
var viewM = new ViewModel();

// Binds query to search
viewM.query.subscribe(viewM.search);

// activates ko bindings on viewM
ko.applyBindings(viewM);

/* Ignore this - This code is stashed away for making this portfolio ready  ----

this.initSearch = function() {
  this.loadData();
};

// wiki Ajax

this.loadData = function() {
    var $wikiElem = $('#wikipedia-links');
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+self.searchInput()+'&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text("failed to get Wikipedia resources");
    }, 2200);
    $wikiElem.text("");
    $.ajax(wikiURL, {
        url: wikiURL,
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
----------------------------------------------------------------------------- */

// API Keys ---------------------------------------/
// AIzaSyCZKRrC3wU4d34eGhYDOGMXNApFpSDZehY < new maps javascript API key
// AIzaSyC3YwElxKD41XTrpD9OSgwfypsNLl2jZ2I < maps old key broken
// AIzaSyB_Rt-rO9b-nB8hRWGdPAAQnCyW3qryPyw < places
// d4cddb89f47216f9226ad28322795461 < openweather
// ee01f3177beaf4c5 < Weather Underground API Key
// ------------------------------------------------/

var mapError = function() {
  $("#mapDiv").append('<h1><b>Google maps cannot be loaded.</b></h1><br>');
};

// Map Style Array
var styleArray = [
      {
      featureType: "all",
      elementType: "geometry",
      stylers: [
      { hue: "#bfff00" },
      { saturation: -80 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#00ffee" },
        { saturation: 80 }
      ]
    },/*{
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        { hue: "#00ffbf" },
        { saturation: 60 }
      ]
    },{
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [
        { hue: "#00ff80" },
        { saturation: 0 }
      ]
    },*/{
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {hue: "#3380cc"},
        {saturation: 80},
        {lightness: 0}
      ]
    }
];

// In case I want to change the map center in the future I added these variables
var mapCenterLat = 34.06328;
var mapCenterLng = -84.54868;

// To make it possible to play with the map more mapOptions
var mapOptions = {
  center: {lat:mapCenterLat, lng:mapCenterLng},
  styles: styleArray,
  zoom: 10,
  disableDefaultUI: true
  };

// At last, the map callback! Make the map. ------------------------------------
function initMap() {
  // I know there's already a div for the map! This method is used for styling
  $("#mapDiv").append('<div id="map"></div>');
  document.getElementById('mapDiv').classList.add('mapDivStyle');
  document.getElementById('map').classList.add('mapStyle');

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  // Calls the VM laymarkers function
  viewM.layMarkers();
}