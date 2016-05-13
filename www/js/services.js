angular.module('app.services', [])


.factory('VigneronsRecherche', function ($http) {

    var VigneronsObject = [];
    return {
        getVignerons: function (CN, textinput) {
            var params = {
               "search": textinput,
                "searchcanton" : CN 
            }
            return $http.get("http://ms-webservices.ch/WorldWine/search.php", { params: params }).then(function (response) {
                VigneronsObject = response;
                return VigneronsObject;
            });
        }
    }
})

.factory('ResultatRecherche', function ($cordovaGeolocation, VigneronsRecherche) {
    var cacheRecherche = [];
    return {
        recherche: function(CN, textinput){
            var cacheRecherche = [];
            var options = { timeout: 10000, enableHighAccuracy: true };
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                //position géolocalisée de l'utilisateur
                var lat = position.coords.latitude;
                var lgt = position.coords.longitude;
                //appel de la librairie pour le calcul des coins depuis la position de l'utilisateur
                var geod = GeographicLib.Geodesic.WGS84;
            //population du tableau des vignerons à proximité
                VigneronsRecherche.getVignerons(CN, textinput).then(function (VigneronsObject) {
                    var vigneronsArray = VigneronsObject.data;

                    for (var i = 0 ; i < vigneronsArray.length; i++) {
                        var vigneronList = vigneronsArray[i];
                        var distance = geod.Inverse(lat, lgt, vigneronsArray[i].lat, vigneronsArray[i].lng)
                        var distanceLisible = (distance.s12.toFixed(3)/1000)
                        vigneronsArray[i].dist = distanceLisible.toFixed(1) ;
                        cacheRecherche.push(vigneronList);
                    }
                });
            });
            return cacheRecherche;
        }
    }
})

.factory('Events', function ($http) {

    var eventsObject = [];
    return {
        getEvents: function () {
            return $http.get("http://ms-webservices.ch/WorldWine/events.php").then(function (response) {
                eventsObject = response;
                return eventsObject;
            });
        }
    }
})

.factory('EventsList', function (Events) {
    var eventCache = [];
    return {
        all : function () {
            var eventCache = [];
                 //population du tableau des vignerons à proximité
            Events.getEvents().then(function (eventObject) {
                    var eventArray = eventObject.data;

                    for (var i = 0 ; i < eventArray.length; i++) {
                        var eventList = eventArray[i];
                        eventCache.push(eventList);
                    }
                });
    return eventCache;
        }
    }
})

.factory('Markers', function ($http) {

    var markers = [];
    return {
        getMarkers: function (params){
            return $http.get("http://ms-webservices.ch/WorldWine/vignerons.php", { params: params }).then(function (response) {
                markers = response;
                return markers;
               
            });

        }
    }

})

.factory('VigneronsProches', function ($cordovaGeolocation, Markers) {
    var vigneronsCache = [];

    return {
        chercherRange : function () {
            var options = { timeout: 10000, enableHighAccuracy: true };
            var vigneronsCache = [];
 
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                //position géolocalisée de l'utilisateur
                var lat = position.coords.latitude;
                var lgt = position.coords.longitude;
                var centerNorm = {
                    lat: lat,
                    lng: lgt
                };
                //appel de la librairie pour le calcul des coins depuis la position de l'utilisateur
                var geod = GeographicLib.Geodesic.WGS84;
                //45 = angle NE, 225 = angle SW, 10e3 = 10 KM pour le rayon de recherche des vignerons
                var rNE = geod.Direct(lat, lgt, 45, 10e3);
                var rSW = geod.Direct(lat, lgt, 225, 10e3);
                var boundsNorm = {
                    northeast: {
                        lat: rNE.lat2,
                        lng: rNE.lon2
                    },
                    southwest: {
                        lat: rSW.lat2,
                        lng: rSW.lon2
                    }
                };
                // paramètres a paser dans l'appel de fonction pour trouver les vignerons à proximité
                var params = {
                    "centre": centerNorm,
                    "bounds": boundsNorm,
                    "zoom": 15,
                    "boundingRadius": 7 //rayon de recherche pour les vignerons à proximité
                };

                //population du tableau des vignerons à proximité
                Markers.getMarkers(params).then(function (markers) {
                    var vigneronsArray = markers.data;

                    for (var i = 0 ; i < vigneronsArray.length; i++) {
                        var vigneronListe = vigneronsArray[i];
                        var distance = geod.Inverse(lat, lgt, vigneronsArray[i].lat, vigneronsArray[i].lng)
                        var distanceLisible = (distance.s12.toFixed(3)/1000)
                        vigneronsArray[i].dist = distanceLisible.toFixed(1) ;
                        vigneronsCache.push(vigneronListe);
                    }
                });
            });
            return vigneronsCache;
        }
    }
})

.factory('GoogleMaps', function ($cordovaGeolocation, $ionicLoading, $rootScope, $cordovaNetwork, $compile, Markers, ConnectivityMonitor) {
    var apiKey = false;
    var map = null;
    var markerCache = [];
 
    function initMap(){
 
        var options = {timeout: 10000, enableHighAccuracy: true};
 
        $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
            var mapOptions = {
                center: latLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
 
            map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
            //Wait until the map is loaded
            google.maps.event.addListenerOnce(map, 'idle', function(){
                 //Load the markers
                loadMarkers();
                //Reload markers every time the map moves
                google.maps.event.addListener(map, 'dragend', function(){
                    console.log("moved!");
                    loadMarkers();
                });
 
                //Reload markers every time the zoom changes
                google.maps.event.addListener(map, 'zoom_changed', function(){
                    console.log("zoomed!");
                    loadMarkers();
                });
 
                enableMap();
            
            });
 
        }, function(error){
            console.log("Could not get location");

        });
    }
    function enableMap() {
        $ionicLoading.hide();
    }

    function disableMap() {
        $ionicLoading.show({
            template: 'You must be connected to the Internet to view this map.'
        });
    }

    function loadGoogleMaps() {

        $ionicLoading.show({
            template: 'Loading Google Maps'
        });

        //This function will be called once the SDK has been loaded
        window.mapInit = function () {
            initMap();
        };

        //Create a script element to insert into the page
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = "googleMaps";

        //Note the callback function in the URL is the one we created above
        if (apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey
      + '&callback=mapInit';
        }
        else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
        }

        document.body.appendChild(script);

    }

    function checkLoaded() {
        if (typeof google == "undefined" || typeof google.maps == "undefined") {
            loadGoogleMaps();
        } else {
            enableMap();
        }
    }
    function loadMarkers() {
 
        var center = map.getCenter();
        var bounds = map.getBounds();
        var zoom = map.getZoom();

        //Convert objects returned by Google to be more readable
        var centerNorm = {
            lat: center.lat(),
            lng: center.lng()
        };

        var boundsNorm = {
            northeast: {
                lat: bounds.getNorthEast().lat(),
                lng: bounds.getNorthEast().lng()
            },
            southwest: {
                lat: bounds.getSouthWest().lat(),
                lng: bounds.getSouthWest().lng()
            }
        };

        var boundingRadius = getBoundingRadius(centerNorm, boundsNorm);

        var params = {
            "centre": centerNorm,
            "bounds": boundsNorm,
            "zoom": zoom,
            "boundingRadius": boundingRadius
        };
            //Get all of the markers from our Markers factory
            Markers.getMarkers(params).then(function(markers){
                var records = markers.data; // remove .result qui semble poser des problèmes
 
                for (var i = 0; i < records.length; i++) {
 
                    var record = records[i];   
                    var markerPos = new google.maps.LatLng(record.lat, record.lng);
 
                    // Add the marker to the map
                    var marker = new google.maps.Marker({
                        map: map,
                        animation: google.maps.Animation.DROP,
                        position: markerPos
                    });

                    var markerData = {
                        lat: record.lat,
                        lng: record.lng,
                        marker: marker
                    };

                    //markerCache.push(markerData);
 
                    var infoWindowContent = '<div ng-controller="infoWindowCtrl"><h4>' + record.name + '</h4><p>' + record.adr + '</p><p>' + record.desc + '</p><p><a href ui-sref="/#/page1/vignerons-details/' + record.id + '" ui-sref-opts="'+record+'"> en savoir plus </a></p></div>';
                    addInfoWindow(marker, infoWindowContent, record);
 
                }
 
            }); 
 
        }
 
  
    function markerExists(lat, lng){
        var exists = false;
        var cache = markerCache;
        for(var i = 0; i < cache.length; i++){
            if(cache[i].lat === lat && cache[i].lng === lng){
                exists = true;
            }
        }
 
        return exists;
    }
 
    function getBoundingRadius(center, bounds){
        return getDistanceBetweenPoints(center, bounds.northeast, 'km');    
    }
 
    function getDistanceBetweenPoints(pos1, pos2, units){
 
        var earthRadius = {
            miles: 3958.8,
            km: 6371
        };
 
        var R = earthRadius[units || 'km'];
        var lat1 = pos1.lat;
        var lon1 = pos1.lng;
        var lat2 = pos2.lat;
        var lon2 = pos2.lng;
 
        var dLat = toRad((lat2 - lat1));
        var dLon = toRad((lon2 - lon1));
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
 
        return d;
 
    }
 
    function toRad(x){
        return x * Math.PI / 180;
    }
 
    function addInfoWindow(marker, message, record) {
 
        var infoWindow = new google.maps.InfoWindow({
            content: message
        });
 
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(map, marker);
        });
 
    }
 
    function addConnectivityListeners(){
 
        if(ionic.Platform.isWebView()){
 
            // Check if the map is already loaded when the user comes online, 
            //if not, load it
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                checkLoaded();
            });
 
            // Disable the map when the user goes offline
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                disableMap();
            });
 
        }
        else {
 
            //Same as above but for when we are not running on a device
            window.addEventListener("online", function(e) {
                checkLoaded();
            }, false);    
 
            window.addEventListener("offline", function(e) {
                disableMap();
            }, false);  
        }
 
    }
 
    return {
        init: function(key){
 
            if(typeof key != "undefined"){
                apiKey = key;
            }
 
            if(typeof google == "undefined" || typeof google.maps == "undefined"){
 
                console.warn("Google Maps SDK needs to be loaded");
 
                disableMap();
 
                if(ConnectivityMonitor.isOnline()){
                    loadGoogleMaps();
                }
            }
            else {
                if(ConnectivityMonitor.isOnline()){
                    initMap();
                    enableMap();
                } else {
                    disableMap();
                }
            }
 
            addConnectivityListeners();
 
        }
    }
 
})

.factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork) {

    return {
        isOnline: function () {

            if (ionic.Platform.isWebView()) {
                return $cordovaNetwork.isOnline();
            } else {
                return navigator.onLine;
            }

        },
        ifOffline: function () {

            if (ionic.Platform.isWebView()) {
                return !$cordovaNetwork.isOnline();
            } else {
                return !navigator.onLine;
            }

        }
    }
})

.factory('HistoryMonitor', function ($ionicHistory) {

    return {
        getData: function () {
            var datahistory = {
                "historic": $ionicHistory.viewHistory(),
                "courant": $ionicHistory.currentView(),
                "precedent": $ionicHistory.backView(),
                "suivant": $ionicHistory.forwardView(),
                "stateCourant": $ionicHistory.currentStateName()
            }
            console.log(datahistory);
            return datahistory;
        }
    }
})

.service('BlankService', [function(){

}]);

