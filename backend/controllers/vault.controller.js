const VaultItem = require('../models/VaultItem');
const { encrypt, decrypt } = require('../utils/encryption');

const getAllItems = async (req, res) => {
  try {
    const { search, category, type, isFavorite } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (isFavorite !== undefined) filter.isFavorite = isFavorite === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const items = await VaultItem.find(filter).sort({ isFavorite: -1, updatedAt: -1 });
    
    // Decrypt the data before sending to user
    const decryptedItems = items.map(item => {
      try {
        const dataObj = JSON.parse(decrypt(item.encryptedData));
        return {
          _id: item._id,
          title: item.title,
          type: item.type,
          category: item.category,
          tags: item.tags,
          isFavorite: item.isFavorite,
          data: dataObj,
          lastAccessed: item.lastAccessed,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };
      } catch (decryptError) {
        console.error('Decrypt error for item:', item._id, decryptError);
        return null;
      }
    }).filter(item => item !== null);

    res.status(200).json({
      success: true,
      data: {
        items: decryptedItems,
        total: decryptedItems.length
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vault items',
      error: error.message
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await VaultItem.findOne({ _id: id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    // Update last accessed time
    await item.updateLastAccessed();
    
    // Decrypt the data
    const dataObj = JSON.parse(decrypt(item.encryptedData));
    
    res.status(200).json({
      success: true,
      data: {
        _id: item._id,
        title: item.title,
        type: item.type,
        category: item.category,
        tags: item.tags,
        isFavorite: item.isFavorite,
        data: dataObj,
        lastAccessed: item.lastAccessed,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vault item',
      error: error.message
    });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, type, data, category, tags, isFavorite } = req.body;
    
    const encryptedData = encrypt(JSON.stringify(data));

    const newItem = new VaultItem({
      userId: req.user._id,
      title,
      type,
      category: category || 'personal',
      encryptedData,
      tags: tags || [],
      isFavorite: isFavorite || false
    });

    await newItem.save();
    
    res.status(201).json({
      success: true,
      message: 'Vault item created successfully',
      data: {
        _id: newItem._id,
        title: newItem.title,
        type: newItem.type,
        category: newItem.category,
        tags: newItem.tags,
        isFavorite: newItem.isFavorite,
        data,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vault item',
      error: error.message
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, data, category, tags, isFavorite } = req.body;

    const item = await VaultItem.findOne({ _id: id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    if (title) item.title = title;
    if (type) item.type = type;
    if (category) item.category = category;
    if (tags) item.tags = tags;
    if (isFavorite !== undefined) item.isFavorite = isFavorite;
    if (data) {
      item.encryptedData = encrypt(JSON.stringify(data));
    }

    await item.save();

    const updatedData = data || JSON.parse(decrypt(item.encryptedData));

    res.status(200).json({
      success: true,
      message: 'Vault item updated successfully',
      data: {
        _id: item._id,
        title: item.title,
        type: item.type,
        category: item.category,
        tags: item.tags,
        isFavorite: item.isFavorite,
        data: updatedData,
        lastAccessed: item.lastAccessed,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vault item',
      error: error.message
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await VaultItem.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vault item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vault item',
      error: error.message
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
