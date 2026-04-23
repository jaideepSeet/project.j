import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function VaultModal({ isOpen, onClose, existingItem, onSave }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('password');
  const [category, setCategory] = useState('');
  const [data, setData] = useState({});

  useEffect(() => {
    if (existingItem) {
      setTitle(existingItem.title);
      setType(existingItem.type);
      setCategory(existingItem.category);
      setData(existingItem.data);
    } else {
      setTitle('');
      setType('password');
      setCategory('');
      setData({});
    }
  }, [existingItem, isOpen]);

  if (!isOpen) return null;

  const handleDataChange = (key, val) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, type, category: category || 'personal', data };
    
    try {
      let res;
      if (existingItem) {
        res = await api.put(`/vault/${existingItem._id}`, payload);
        toast.success('Item updated');
      } else {
        res = await api.post('/vault', payload);
        toast.success('Item saved to vault');
      }
      onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-borderBase flex justify-between items-center">
          <h2 className="text-xl font-bold">{existingItem ? 'Edit Vault Item' : 'Add to Vault'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto w-full max-w-lg">
          <form id="vault-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" placeholder="e.g., Personal Gmail" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} disabled={!!existingItem} className="input-field bg-transparent">
                  <option value="password">Password</option>
                  <option value="note">Secure Note</option>
                  <option value="apikey">API Key</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" placeholder="e.g., Web, Work" list="categories" />
              </div>
            </div>

            <div className="pt-4 border-t border-borderBase">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-gray-500 text-center">Secure Data</h3>
              
              {type === 'password' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">URL (Optional)</label>
                    <input type="url" value={data.url || ''} onChange={(e) => handleDataChange('url', e.target.value)} className="input-field py-1" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Username / Email</label>
                    <input type="text" value={data.username || ''} onChange={(e) => handleDataChange('username', e.target.value)} required className="input-field py-1" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Password</label>
                    <input type="password" value={data.password || ''} onChange={(e) => handleDataChange('password', e.target.value)} required className="input-field py-1" />
                  </div>
                </div>
              )}

              {type === 'note' && (
                <div>
                  <label className="block text-xs mb-1">Content</label>
                  <textarea value={data.content || ''} onChange={(e) => handleDataChange('content', e.target.value)} required className="input-field py-1 min-h-[120px]" />
                </div>
              )}

              {type === 'apikey' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Service Name</label>
                    <input type="text" value={data.service || ''} onChange={(e) => handleDataChange('service', e.target.value)} required className="input-field py-1" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">API Key / Token</label>
                    <input type="password" value={data.key || ''} onChange={(e) => handleDataChange('key', e.target.value)} required className="input-field py-1" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-borderBase flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Cancel</button>
          <button type="submit" form="vault-form" className="btn-primary">
            {existingItem ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
