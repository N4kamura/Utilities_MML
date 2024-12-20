const API_KEY = `INSERT_API_KEY_HERE`;

function geocodeAddress() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    let rowNumber = lastRow;

    // Buscar hacia atrás desde la última fila para encontrar una fila con coordenadas completas
    while (rowNumber > 1) { // Evitar salir del rango válido
        const existingCoordinates = sheet.getRange(rowNumber, 12).getValue();
        if (!existingCoordinates) {
            // Si no hay coordenadas, continuar hacia atrás
            rowNumber--;
        } else {
            // Si se encuentra una fila con coordenadas, comenzar desde la siguiente fila
            rowNumber++;
            break;
        }
    }

    if (rowNumber > lastRow) {
        SpreadsheetApp.getUi().alert("Todas las filas ya tienen coordenadas.");
        return;
    }

    const addresses = sheet.getRange(rowNumber, 9, lastRow - rowNumber + 1, 4).getValues(); // Ajuste del rango dinámico

    addresses.forEach((row, index) => {
        const addressField = row[0]; // Dirección en la columna A (índice 0)
        const existingCoordinates = sheet.getRange(index + rowNumber, 12).getValue();

        // Filtrar por: Coordenadas ya existentes y longitud de la dirección
        if (existingCoordinates || addressField.length > 100 || addressField.length === 0) {
            return;
        }

        const fullAddress = `${addressField}, ${row[2]}, Lima, Perú`;

        let latitud = "";
        let longitud = "";

        try {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${API_KEY}`;
            const response = UrlFetchApp.fetch(geocodeUrl);
            const data = JSON.parse(response.getContentText());

            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                latitud = location.lat;
                longitud = location.lng;
            }
        } catch (error) {
            Logger.log(`Error al procesar la dirección: ${fullAddress} - ${error}`);
        }

        // Guardar latitud y longitud 
        sheet.getRange(index + rowNumber, 12).setValue(
          `${latitud}, ${longitud}`
        );
    });

    SpreadsheetApp.flush();
    SpreadsheetApp.getUi().alert("Geocodificación completada");
}

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("Geocodificación")
        .addItem("Geocodificar direcciones", "geocodeAddress")
        .addToUi();
}
