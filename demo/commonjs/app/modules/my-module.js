var moment = require('moment');

module.exports = function sayHello() {
  console.log('hello from the other siiiiiiide!');
  console.log('currently it is', moment().calendar());
}
