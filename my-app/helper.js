class Helper{
  static parseDateString(dateString) {
    // Split the string into date and time parts
    const [datePart, timePart] = dateString.split(' ');
  
    // Split the date part into day, month, and year
    const [day, month, year] = datePart.split('.');
  
    // Split the time part into hour and minute
    const [hour, minute] = timePart.split(':');
  
    // Create a new Date object
    // Note: Months in JavaScript are zero-based, so we subtract 1 from the parsed month
    const parsedDate = new Date(year, month - 1, day, hour, minute);
  
    return parsedDate;
  }
  static dmsToDecimal(dmsString) {
    // Split the DMS string into parts
    const parts = dmsString.split(/°|′|″|,|\s/).filter(part => part !== '');
  
    // Extract values for degrees, minutes, seconds, direction
    const latDeg = parseFloat(parts[0]);
    const latMin = parseFloat(parts[1]);
    const latSec = parseFloat(parts[2]);
    const latDir = parts[3].toUpperCase();
  
    const lonDeg = parseFloat(parts[4]);
    const lonMin = parseFloat(parts[5]);
    const lonSec = parseFloat(parts[6]);
    const lonDir = parts[7].toUpperCase();
  
    // Calculate decimal degrees
    const latitude = latDeg + latMin / 60 + latSec / 3600 * (latDir === 'S' ? -1 : 1);
    const longitude = lonDeg + lonMin / 60 + lonSec / 3600 * (lonDir === 'W' ? -1 : 1);
  
    return { latitude, longitude };
  }
  static meterFormatter(meters){
    var km = meters / 1000;
    return km.toFixed(1) + " km";
  }
}