const { connect, connection } = require('mongoose');

connect('mongodb://localhost/snApiDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connection;