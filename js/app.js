var initialTrails = [
      {
    name: "Kennesaw Mountain Trail",
    address: "900 Kennesaw Mountain Dr, Kennesaw Georgia",
    description: "Run or hike this 2.4 mile round-trip trail to climb Kennesaw Mountain. Depending on your fitness level and how fast you attempt to get to the top, this trail can vary in difficulty. This trail is heavy volume, so expect a crowd on a nice day!",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zZORWFp4Wxqg.kAyWKntuuMJ4&hl=en",
    lat: "33.98363",
    lng: "-84.57836"
      },
      {
    name: "Kennesaw Mountain Dr Road-Run",
    address: "900 Kennesaw Mountain Dr, Kennesaw Georgia",
    description: "This course is a real challenge and completing it is a huge confidence builder! This run is all uphill up a mountain road for the first half, and then back downhill for the second half. There are some very sightworthy views from the road under certian conditions.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.k2ExBAbfkAX0&hl=en",
    lat: "33.98515",
    lng: "-84.58278"
      },
      {
    name: "Noses Creek Trail",
    address: "1520 Burnt Hickory Rd NW, Marietta, GA 30064",
    description: "This trail starts and ends at two parking lots and is about three miles long. I like to park at one of the areas and then run to the other, then turn back the same way. It makes for a pretty easy and peaceful 6 mile round trip on a hot day in Georgia, as most of the way is under thick trees.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.k1XcH0DRGg5o&hl=en",
    lat: "33.96342",
    lng: "-84.59376"
      },
      {
    name: "Noonday Creek Trail",
    address: "3009 Bells Ferry Rd NE Marietta, Georgia",
    description: "This trail is good for bikers and runners who are looking to train on a flat and gradually sloped pathway. If you are looking for road running away or off of roads, this trail is paved, but it is not beside a road. The path I usually take only requires crossing one road; however, it is possible to take the trail all the way to adjoining trails at Kennesaw National Battlefield Park.",
    trailMapUrl: "https://www.google.com/maps/d/embed?mid=zQIhibTo9Q34.kI1WmdKvbRTU&hl=en",
    lat: "34.02328",
    lng: "-84.54868"
      },
      {
    name: "Red Top Mountain State Park",
    address: "659 Red Top Mountain Rd SE, Acworth, GA 30121",
    description: "",
    trailMapUrl: "",
    lat: "34.1546",
    lng: "-84.70299"
      }
      ];

var Trail = function(data) {
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.description = ko.observable(data.description);
    this.trailMapUrl = ko.observable(data.trailMapUrl);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
};

var map;
var searchAutoComplete = ko.observableArray([]);

// Start of viewModel
var viewModel = function() {

var self = this;

this.trailList = ko.observableArray([]);

this.markerList = ko.observableArray([]);

initialTrails.forEach(function(trail){
    self.trailList.push(new Trail(trail));
  });

this.currentTrail = ko.observable(this.trailList()[0]);

this.searchInput = ko.observable('');

this.selectTrail = function(selectedTrail) {
    self.currentTrail(selectedTrail);
};

this.initializeMap = function() {
      $("#mapDiv").append('<div id="map"></div>');

      map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng("34.06328", "-84.54868"),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        disableDefaultUI: true
       });
};


this.layMarkers = function() {
        var infowindow = new google.maps.InfoWindow();

        initialTrails.forEach(function(trail){

          var marker = new google.maps.Marker({
              map: map,
              position: new google.maps.LatLng(trail.lat, trail.lng),
              title: trail.name,
              clickable: true,
              animation: google.maps.Animation.DROP
          });

          searchAutoComplete.push(trail.name); // Creates an array of all the names of the trails

          var contentString = '<p><b>'+trail.name+'</b><br>'+trail.address+'</p>';

          google.maps.event.addListener(marker, 'click', function () {
              self.currentTrail(trail);
              toggleBounce();
              self.searchInput(trail.name);
              infowindow.setContent(contentString);
              infowindow.open(map, marker);
          });

          function toggleBounce() {
            if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
              stopAnimation(marker);
            }
          };

          function stopAnimation(marker) {
            setTimeout(function(){
              marker.setAnimation(null);
            }, 2200);
          };
      });
};

/*
this.detailsEnabled = ko.observable(false);

this.enableDetails = function() {
    self.detailsEnabled(true);
};

this.disableDetails = function() {
    self.detailsEnabled(false);
};
*/

this.initSearch = function() {
  this.loadData();
};

// Much obliged to Source: http://www.maxburstein.com/blog/create-your-own-jquery-autocomplete-function/ & at https://gist.github.com/mburst/4575043

//console.log(self.searchAutoComplete());

var trailNames = searchAutoComplete();
var drew = false;
var cache = {};

$("#search").on("keyup", function(event){

        //var query = $("#search").val()
        var query = $("#search").val()

        if($("#search").val().length > 2){

            //Check if we've searched for this term before
            if(query in cache){
                results = cache[query];
            }
            else{
                //Case insensitive search for our people array
                var results = $.grep(trailNames, function(item){
                    return item.search(RegExp(query, "i")) != -1;
                });

                //Add results to cache
                cache[query] = results;
            }
            //First search
            if(drew == false){
                //Create list for results
                $("#search").after('<ul id="res"></ul>');

                //Prevent redrawing/binding of list
                drew = true;

                //Bind click event to list elements in results
                $("#res").on("click", "li", function(){
                    $("#search").val($(this).text());
                    $("#res").empty();
                 });
            }
            //Clear old results
            else{
                $("#res").empty();
            }

            //Add results to the list
            for(term in results){
                $("#res").append("<li>" + results[term] + "</li>");
            }
        }
        //Handle backspace/delete so results don't remain with less than 3 characters
        else if(drew){
            $("#res").empty();
        }
});

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

// ee01f3177beaf4c5 <<<<<<<<<    Weather Underground API Key todo: add weather data to area of trail
this.initializeMap();
this.layMarkers();
}; // end of ViewModel

var googleError = function(){
  alert("Google Maps Failed...");
};

$(document).ready(function(){
  ko.applyBindings(new viewModel());
});