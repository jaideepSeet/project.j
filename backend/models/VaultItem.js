const mongoose = require('mongoose');

const vaultItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['password', 'note', 'api_key'],
    default: 'password'
  },
  encryptedData: {
    type: String,
    required: [true, 'Data is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['personal', 'work', 'finance', 'social', 'development', 'other'],
    default: 'personal'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
vaultItemSchema.index({ userId: 1, title: 'text', category: 1, type: 1 });

// Method to update last accessed time
vaultItemSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('VaultItem', vaultItemSchema);
