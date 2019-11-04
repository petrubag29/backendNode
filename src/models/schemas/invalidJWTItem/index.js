const mongoose = require('mongoose');

const invalidJWTItemSchema = mongoose.Schema({
  JWT: {
    type: String,
    required: true,
    index: { unique: true },
  },
});

invalidJWTItemSchema.post('save', (error, doc, next) => {
  if (error) throw new Error(error);
  next();
});

invalidJWTItemSchema.plugin(require('mongoose-ttl'), { ttl: '7d' });

module.exports = invalidJWTItemSchema;
