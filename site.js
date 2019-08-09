$(function () {

    var displayPostcodeData = function (postcode_data) {
        $('#col_postcode').hide();
        $('#col_postcode').empty();
        $('#col_postcode').append('<h5>' + postcode_data.postcode + '</h5>');
        $('#col_postcode').append('<p>Admin district: ' + postcode_data.admin_district + '</p>');
        $('#col_postcode').append('<p>Ward: ' + postcode_data.admin_ward + '</p>');
        $('#col_postcode').show();
    };

    var getGISLayer = function (layer, bbox, callback) {
        $.ajax({
            url: 'https://maps.bristol.gov.uk/arcgis/rest/services/ext/historic_20190624/FeatureServer/' + layer + '/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=0.5953136906273402&geometry={"xmin":' + bbox[0] + ',"ymin":' + bbox[1] + ',"xmax":' + bbox[2] + ',"ymax":' + bbox[3] + ',"spatialReference":{"wkid":4326}}&geometryType=esriGeometryEnvelope&inSR=4326&outFields=*&outSR=4326',
            dataType: 'json',
            success: function (data) {
                callback(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // 
            }
        });
    };

    var getConservationArea = function (bbox) {
        getGISLayer('16', bbox, function (data) {
            $('#col_conservationareas').hide();
            $('#col_conservationareas').empty();
            $('#col_conservationareas').append('<h5>Conservation Areas</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_conservationareas').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_conservationareas').append('<p>' + data.features[x].attributes.LOCALITY + ': ' + '<a href="' + data.features[x].attributes.PDF + '" target="_blank">PDF</a></p>');
                    }
                }
            }
            $('#col_conservationareas').show();
        });
    };

    var getListedBuilding = function (bbox) {
        getGISLayer('11', bbox, function (data) {
            $('#col_listedbuildings').hide();
            $('#col_listedbuildings').empty();
            $('#col_listedbuildings').append('<h5>Listed buildings</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_listedbuildings').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_listedbuildings').append('<p>' + data.features[x].attributes.ALT_LIST_NAME + '</p>');
                    }
                }
            }
            $('#col_listedbuildings').show();
        });
    };

    var getScheduledMonuments = function (bbox) {
        getGISLayer('9', bbox, function (data) {
            $('#col_scheduledmonuments').hide();
            $('#col_scheduledmonuments').empty();
            $('#col_scheduledmonuments').append('<h5>Scheduled Monuments</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_scheduledmonuments').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_scheduledmonuments').append('<p>' + data.features[x].attributes.KNOWN_AS + ' ' + data.features[x].attributes.PERIOD_TEXT + '</p>');
                    }
                }
            }
            $('#col_scheduledmonuments').show();
        });
    };

    var getHistoricParksAndGardens = function (bbox) {
        getGISLayer('14', bbox, function (data) {
            $('#col_historicparksandgardens').hide();
            $('#col_historicparksandgardens').empty();
            $('#col_historicparksandgardens').append('<h5>Historic Parks and Gardens</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_historicparksandgardens').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_historicparksandgardens').append('<p>' + data.features[x].attributes.NAME + ': ' + data.features[x].attributes.DESCRIPTION + '</p>');
                    }
                }
            }
            $('#col_historicparksandgardens').show();
        });
    };


    var getRegisteredHistoricParks = function (bbox) {
        getGISLayer('15', bbox, function (data) {
            $('#col_registeredhistoricparks').hide();
            $('#col_registeredhistoricparks').empty();
            $('#col_registeredhistoricparks').append('<h5>Registered Historic Parks</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_registeredhistoricparks').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_registeredhistoricparks').append('<p>Grade ' + data.features[x].attributes.GRADE + ': ' + data.features[x].attributes.NAME + '</p>');
                    }
                }
            }
            $('#col_registeredhistoricparks').show();
        });
    };

    var getLocalList = function (bbox) {
        getGISLayer('31', bbox, function (data) {
            $('#col_locallist').hide();
            $('#col_locallist').empty();
            $('#col_locallist').append('<h5>Local List</h5>');
            if (data && data.features) {
                if (data.features.length === 0) $('#col_locallist').append('<p>None found</p>');
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_locallist').append('<p>' + data.features[x].attributes.DATE_OF_DEVELOPMENT + ': ' + data.features[x].attributes.ESTATE_DESCRIPTION + '</p>');
                    }
                }
            }
            $('#col_locallist').show();
        });
    };

    // Search event handler
    $('#btn_search').on('click', function () {
        // Get the postcode
        var postcode = $('#txt_postcode').val();
        var metres = $('#sel_distance').val();
        $.ajax({
            url: 'https://api.postcodes.io/postcodes/' + encodeURI(postcode),
            dataType: 'json',
            success: function (data) {
                displayPostcodeData(data.result);

                // create our bounding box
                var point = turf.point([data.result.longitude, data.result.latitude]);
                var buffered = turf.buffer(point, metres, { units: 'metres' });
                var bbox = turf.bbox(buffered);

                getConservationArea(bbox);
                getListedBuilding(bbox);
                getScheduledMonuments(bbox);
                getHistoricParksAndGardens(bbox);
                getRegisteredHistoricParks(bbox);
                getLocalList(bbox);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Invalid postcode
            }
        });

    });
});