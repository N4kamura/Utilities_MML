function generateKML() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  var kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
  kml += '  <Document>\n';

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    var nro = row[0]
    var resolucion = row[1];
    var fecha = row[2];
    var entidad = row[3];
    var ubicacion = row[4];
    var cantidad = row[5];
    var observacion = row[6];
    var distrito = row[7];
    var coords = row[8];  // Coordenads en formato lat,long 

    var parts = coords.split(',');
    if (parts.length >= 2) {
      var lat = parts[0].trim();
      var lng = parts[1].trim();

      coords = lng + ',' + lat + ',0';
    } else {
      continue;
    }

    var description = '<![CDATA[' +
      '<b>NRO:</b> ' + (nro || '') + '<br/>' +
      '<b>RESOLUCION:</b> ' + (resolucion || '') + '<br/>' +
      '<b>FECHA:</b> ' + (fecha || '') + '<br/>' +
      '<b>ENTIDAD:</b> ' + (entidad || '') + '<br/>' +
      '<b>UBICACIÓN:</b> ' + (ubicacion || '') + '<br/>' +
      '<b>CANTIDAD:</b> ' + (cantidad || '') + '<br/>' +
      '<b>OBSERVACION:</b> ' + (observacion || '') + '<br/>' +
      '<b>DISTRITO:</b> ' + (distrito || '') +
      ']]>';

    // Placemark
    var coordsPairs = coords.trim().split(' ');
    Logger.log(coordsPairs)

    // Conversión de lat,long a long,lat,0 para estándar de KML
    var convertedCoords = coordsPairs.map(function(pair) {
      var parts = pair.split(',');
      if (parts.length >= 2) {
        var lng = parts[0].trim();
        var lat = parts[1].trim();
        return lng + ',' + lat + ',0'
      }
      return '';
    }).filter(function(v) { return v !== ''; });

    // Determinaciópn del tipo de geometría
    var geometryType;
    if (convertedCoords.length === 1) {
      // Punto
      geometryType = 'Point';
    } else {
      // Múltiples pares
      // Si el primer par es igual al último => Polígono, si no => Línea
      if (convertedCoords[0] === convertedCoords[convertedCoords.length-1]) {
        geometryType = 'Polygon';
      } else {
        geometryType = 'LineString';
      }
    }

    kml += '    <Placemark>\n';
    // Podemos usar NRO. o ENTIDAD como nombre del marcador, ajusta según tu preferencia
    kml += '      <name>' + (resolucion || 'Sin Nombre') + '</name>\n';
    kml += '      <description>' + description + '</description>\n';

    // Generar geometría según el tipo
    if (geometryType === 'Point') {
      kml += '      <Point>\n';
      kml += '        <coordinates>' + convertedCoords[0] + '</coordinates>\n';
      kml += '      </Point>\n';
    } else if (geometryType === 'LineString') {
      kml += '      <LineString>\n';
      kml += '        <coordinates>\n';
      kml += '          ' + convertedCoords.join(' ') + '\n';
      kml += '        </coordinates>\n';
      kml += '      </LineString>\n';
    } else if (geometryType === 'Polygon') {
      kml += '      <Polygon>\n';
      kml += '        <outerBoundaryIs>\n';
      kml += '          <LinearRing>\n';
      kml += '            <coordinates>\n';
      kml += '              ' + convertedCoords.join(' ') + '\n';
      kml += '            </coordinates>\n';
      kml += '          </LinearRing>\n';
      kml += '        </outerBoundaryIs>\n';
      kml += '      </Polygon>\n';
    }

    kml += '    </Placemark>\n';
  }
  
  kml += '  </Document>\n';
  kml += '</kml>';

  // Guarda el archivo KML en Drive
  var fileName = 'datos_generados.kml';
  var file = DriveApp.createFile(fileName, kml, MimeType.PLAIN_TEXT);

  // Alerta de creación de archivo kml
  // SpreadsheetApp.getUi().alert('El archivo KML se ha generado con éxito.\n'+'Puedes encontrarlo en tu Google Drive:\n' + file.getUrl());

  Logger.log('Archivo KML creado: ' + file.getUrl());
}
