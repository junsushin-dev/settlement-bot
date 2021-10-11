function toLocaleString(number) {
  var numStr = number.toString();
  var res = '';
  for(var i = 1; i <= numStr.length; i++) {
    res = numStr.charAt(numStr.length - i) + res;
    if(i % 3 === 0) {
      res = ',' + res;
    }
  }
  return res;  
}

exports.toLocaleString = toLocaleString;