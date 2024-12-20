function showMapModal() {
    var html = HtmlService.createHtmlOutputFromFile('map')
      .setWidth(800)
      .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, 'Mapa Interactivo');
  }
  
  function saveCoordinatesToRow(coordinates, rowNumber) {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var range = sheet.getRange(rowNumber, 9); // Columna I
      range.setValue(coordinates); // Escribe las coordenadas en la celda
    } catch (err) {
      throw new Error('Error al escribir las coordenadas en la hoja: ' + err.message);
    }
  }
  
  function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Mapa')
      .addItem('Abrir Mapa', 'showMapModal') // Vincula con la función
      .addToUi();
  }
