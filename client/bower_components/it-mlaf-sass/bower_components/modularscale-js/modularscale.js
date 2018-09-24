var msValue = 0;
var msBases = 1;
var msRatios = (1+ Math.sqrt(5))/2;

// Values
var minorSecond   = 1.067;
var majorSecond   = 1.125;
var minorThird    = 1.2;
var majorThird    = 1.25;
var perfectFourth = 1.333;
var augFourth    = 1.414;
var perfectFifth  = 1.5;
var minorSixth    = 1.6;
var goldenSection = 1.618;
var majorSixth    = 1.667;
var minorSeventh  = 1.778;
var majorSeventh  = 1.875;
var octave        = 2;
var majorTenth    = 2.5;
var majorEleventh = 2.667;
var majorTwelfth  = 3;
var doubleOctave  = 4;


// Unique via http://jsfiddle.net/gabrieleromanato/BrLfv/
var msUnique = function(origArr) {

    origArr = origArr.sort(function(a,b) {
      var x = a[0];
      var y = b[0];
      return x-y;
    });

    newArr = [];
    var lastVal = null;

    for (var i = 0; i < origArr.length; i++) {
      var currentVal = origArr[i][0];
      if (currentVal != lastVal) {
        newArr.push(origArr[i]);
      };

      lastVal = currentVal;

    }

    return newArr;
}

// Main function
function ms(value, bases, ratios) {

  if (typeof value === 'string') {
    value = 1;
  }
  if (value == undefined) {
    value = msValue;
  }
  if (bases == undefined) {
    bases = msBases;
  }
  if (ratios == undefined) {
    ratios = msRatios;
  }

  // Error hangling
  if (bases <= 0) {
    bases = 1;
  }
  if (typeof Math.abs(bases[0]) != 'number') {
    bases = 1;
  }

  // Make arrays
  var bases = (''+bases).split(',');
  var ratios = (''+ratios).split(',');

  // Seed return array
  var r = [];
  var strand = null;

  for (var ratio = 0; ratio < ratios.length; ratio++) {
    for (var base = 0; base < bases.length; base++) {

      strand = (base + ratio);

      // Seed list with an initial value
      // r.push(bases[base]);

      // Find values on a positive scale
      if (value >= 0) {
        // Find lower values on the scale
        var i = 0;
        while((Math.pow(ratios[ratio], i) * bases[base]) >= bases[0]) {
          r.push([Math.pow(ratios[ratio], i) * bases[base], strand]);
          i--;
        }

        // Find higher possible values on the scale
        var i = 0;
        while(Math.pow(ratios[ratio], i) * bases[base] <= Math.pow(ratios[ratio], value + 1) * bases[base]) {
          r.push([Math.pow(ratios[ratio], i) * bases[base], strand]);
          i++;
        }
      } else {
        // Find values on a negitve scale
        var i = 0;
        while((Math.pow(ratios[ratio], i) * bases[base]) <= bases[0]) {
          r.push([Math.pow(ratios[ratio], i) * bases[base], strand]);
          i++;
        }

        // // Find higher possible values on the scale
        var i = 0;
        while((Math.pow(ratios[ratio], i) * bases[base]) >= (Math.pow(ratios[ratio], value - 1) * bases[base])) {
          if (Math.pow(ratios[ratio], i) * bases[base] <= bases[0]) {
            r.push([Math.pow(ratios[ratio], i) * bases[base], strand]);
          }
          i--;
        }
      }
    }
  }

  r = msUnique(r);

  // reverse array if value is negitive
  if(value < 0) {
    r = r.reverse();
  }

  return r[Math.abs(value)][0];
}