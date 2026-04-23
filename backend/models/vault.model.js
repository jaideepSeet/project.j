const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String, // 'password', 'note', 'apikey'
    required: true,
    enum: ['password', 'note', 'apikey']
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  // We will store the encrypted JSON string containing the specific fields for each type. 
  // For 'password', json will have { url, username, password }
  // For 'note', json will have { content }
  // For 'apikey', json will have { service, key }
  encryptedData: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vault', vaultSchema);
