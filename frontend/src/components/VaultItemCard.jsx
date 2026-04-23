import { useState } from 'react';
import { Eye, EyeOff, Copy, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function VaultItemCard({ item, onDelete, onEdit }) {
  const [revealed, setRevealed] = useState(false);

  // Masks string to dots
  const maskString = (str) => '•'.repeat(Math.min(str?.length || 8, 12));

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${item.title}?`)) {
      try {
        await api.delete(`/vault/${item._id}`);
        onDelete(item._id);
        toast.success('Item deleted');
      } catch (err) {
        toast.error('Failed to delete item');
      }
    }
  };

  const renderContent = () => {
    switch (item.type) {
      case 'password':
        return (
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="text-sm font-medium text-gray-500 w-20">URL</span>
              <span className="text-sm flex-1 truncate ml-2" title={item.data.url}>{item.data.url || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="text-sm font-medium text-gray-500 w-20">Username</span>
              <span className="text-sm flex-1 truncate ml-2 font-mono">{item.data.username}</span>
              <button onClick={() => copyToClipboard(item.data.username, 'Username')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 ml-2">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="text-sm font-medium text-gray-500 w-20">Password</span>
              <span className="text-sm flex-1 truncate ml-2 font-mono">{revealed ? item.data.password : maskString(item.data.password)}</span>
              <div className="flex ml-2 space-x-1">
                <button onClick={() => setRevealed(!revealed)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyToClipboard(item.data.password, 'Password')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      case 'note':
        return (
          <div className="space-y-3 mt-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded relative group">
              <div className={`text-sm whitespace-pre-wrap ${!revealed && 'blur-sm select-none'}`}>
                {revealed ? item.data.content : maskString('hiddencontenthere')}
              </div>
              <div className="absolute top-2 right-2 flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => setRevealed(!revealed)} className="p-1 bg-white dark:bg-gray-700 shadow rounded text-gray-500">
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyToClipboard(item.data.content, 'Note')} className="p-1 bg-white dark:bg-gray-700 shadow rounded text-gray-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      case 'apikey':
        return (
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="text-sm font-medium text-gray-500 w-20">Service</span>
              <span className="text-sm flex-1 truncate ml-2 font-mono">{item.data.service || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <span className="text-sm font-medium text-gray-500 w-20">Key</span>
              <span className="text-sm flex-1 truncate ml-2 font-mono">{revealed ? item.data.key : maskString(item.data.key)}</span>
              <div className="flex ml-2 space-x-1">
                <button onClick={() => setRevealed(!revealed)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                  {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyToClipboard(item.data.key, 'API Key')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="card-container break-inside-avoid mb-6 relative group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold pr-16">{item.title}</h3>
          <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-primary-300 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
            {item.type}
          </span>
          <span className="text-xs ml-2 text-gray-500 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      {renderContent()}

      <div className="absolute top-4 right-4 flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={handleDelete} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
