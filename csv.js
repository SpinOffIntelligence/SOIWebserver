var csv = require('csv-parser')
var fs = require('fs')

fs.createReadStream('uploadExcel.csv')
  .pipe(csv())
  .on('data', function (data) {
    console.dir(data);
  })