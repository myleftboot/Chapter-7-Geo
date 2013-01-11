// All source code Copyright 2013 Cope Consultancy Services. All rights reserved


// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create base root window
//
var win1 = Titanium.UI.createWindow({  
    backgroundColor:'#fff'
});

function isLocationAuthorized(_args) {
    //check that we are allowed to use
    var retVal = true;
    if (!Ti.Geolocation.locationServicesEnabled) return false;
    
    if (Ti.Platform.name === 'iPhone OS') {
      // Explain to the user why we are going to use the location services.
    
      Ti.Geolocation.purpose = _args.purpose;
      var authorization = Titanium.Geolocation.locationServicesAuthorization;
      
      if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
      	// user has decided to not allow this use of location
      	retVal = false;
      }
      else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
      	// a device restriction prevents us from using location services
      	retVal = false;
      } else retVal = true;
    }
    return retVal;
    
};

function getLocation(_args) {
    // we dont ned to be any more accurate than this
    // ACCURACY_LOW is one of the few settings that work with both Android and iOS
    // see the Ti API documentation
    Ti.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_LOW;

    Ti.Geolocation.getCurrentPosition(function(e)
    {
       if (!e.success || e.error)
       {
          alert('error ' + JSON.stringify(e.error));
       }
       if (_args.success) _args.success(e.coords)

    });
     
};

function setLabelText(_args) {
	coords.text = 'Lat: '+_args.latitude+' Lon :'+_args.longitude+' altitude : '+_args.altitude;
}

function distanceinM(_args) {
    // ---- extend Number object with methods for converting degrees/radians

    /** Converts numeric degrees to radians */
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }
    
    var R = 3960; // m    --- if you want it in KM then use 6371
    var dLat = (_args.toLat-_args.fromLat).toRad();
    var dLon = (_args.toLon-_args.fromLon).toRad();
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(_args.fromLat.toRad()) * Math.cos(_args.toLat.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    var d = R * c;
    
    return d;
};

function distanceFromTheEquator(_args) {
    return distanceinM({
                 fromLon : _args.lon,
                 fromLat : _args.lat,
                 toLon   : _args.lon,
                 toLat   : 0});
};

function setDistanceLabel(_args) {
	coords.text = 'Distance from the equator: '+parseInt(_args.distance);
};

var coords = Ti.UI.createLabel({});

if (isLocationAuthorized({purpose:'To display your current co-ordinates'})) {
	getLocation(
		{success : function(e) 
			{setDistanceLabel(
				{distance : distanceFromTheEquator(
					{lat: e.latitude,
					 lon: e.longitude
					 })
				})
			}
		}
	);
};

win1.add(coords);
win1.open();