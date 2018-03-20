const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  test: {type: String}
});
const model = mongoose.model('test', schema);

mongoose.connect('mongodb://localhost/financas');

mongoose.connection.on('connected', function () {
  model.findById(1).then(function (result) {
    console.log('found', result);
  }).catch(function (error) {
    console.error(error);
  })
});