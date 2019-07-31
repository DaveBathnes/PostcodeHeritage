$(function () {

    var displayPostcodeData = function (postcode_data) {
        $('#col_postcode').hide();
        $('#col_postcode').empty();
        $('#col_postcode').append('<h5>' + postcode_data.postcode + '</h5>');
        $('#col_postcode').append('<p class="lead">Admin district: ' + postcode_data.admin_district + '</p>');
        $('#col_postcode').append('<p class="lead">Ward: ' + postcode_data.admin_ward + '</p>');
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

            }
        });
    };


    var getBuildingData = function (bbox) {
        getGISLayer('11', bbox, function (data) {
            $('#col_buildings').hide();
            $('#col_buildings').empty();
            $('#col_buildings').append('<h5>Listed buildings</h5>');
            if (data && data.features) {
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_buildings').append('<p class="lead">' + data.features[x].attributes.ALT_LIST_NAME + '</p>');
                    }
                }
            }

            $('#col_buildings').show();
        });
    };

    var getMonumentsData = function (bbox) {
        getGISLayer('9', bbox, function (data) {
            $('#col_monuments').hide();
            $('#col_monuments').empty();
            $('#col_monuments').append('<h5>Monuments</h5>');
            if (data && data.features) {
                for (x = 0; x < data.features.length; x++) {
                    if (x < 3) {
                        $('#col_monuments').append('<p class="lead">' + data.features[x].attributes.KNOWN_AS + ' ' + data.features[x].attributes.PERIOD_TEXT + '</p>');
                    }
                }
            }

            $('#col_monuments').show();
        });
    };

    // Search event handler
    $('#btn_search').on('click', function () {
        // Get the postcode
        var postcode = $('#txt_postcode').val();
        $.ajax({
            url: 'https://api.postcodes.io/postcodes/' + encodeURI(postcode),
            dataType: 'json',
            success: function (data) {
                displayPostcodeData(data.result);

                // create our bounding box
                var point = turf.point([data.result.longitude, data.result.latitude]);
                var buffered = turf.buffer(point, 500, { units: 'metres' });
                var bbox = turf.bbox(buffered);

                getBuildingData(bbox);
                getMonumentsData(bbox);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Invalid postcode
            }
        });

    });
});