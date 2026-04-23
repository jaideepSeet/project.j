import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import VaultItemCard from '../components/VaultItemCard';
import VaultModal from '../components/VaultModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Plus, LogOut, Moon, Sun, Filter } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  const fetchVaultItems = async () => {
    try {
      const res = await api.get('/vault');
      setItems(res.data.data.items);
    } catch (err) {
      toast.error('Failed to load vault items');
    }
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter(item => item._id !== id));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (savedItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(item => item._id === savedItem._id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = savedItem;
        return next;
      }
      return [savedItem, ...prev];
    });
  };

  const openNewItemModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                            item.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [items, search, filterType]);

  // Derive categories for quick stats
  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-borderBase bg-surface sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-xl font-bold hidden sm:block">Data Vault</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium mr-2">Hi, {user?.firstName}</span>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <button onClick={logout} className="flex items-center text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Your Secure Data</h2>
            <p className="text-gray-500 mt-1">Manage passwords, API keys, and secure notes.</p>
          </div>
          <button onClick={openNewItemModal} className="btn-primary flex items-center whitespace-nowrap">
            <Plus className="w-5 h-5 mr-2" /> Add Vault Item
          </button>
        </div>

        {/* Stats / Categories Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-xl p-4 flex flex-col justify-center items-center font-semibold">
            <span className="text-3xl font-bold mb-1">{items.length}</span>
            <span className="text-xs uppercase tracking-wider">Total Items</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded-xl p-4 flex flex-col justify-center items-center font-semibold">
            <span className="text-3xl font-bold mb-1">{items.filter(i => i.type === 'password').length}</span>
            <span className="text-xs uppercase tracking-wider">Passwords</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl p-4 flex flex-col justify-center items-center font-semibold">
            <span className="text-3xl font-bold mb-1">{items.filter(i => i.type === 'note').length}</span>
            <span className="text-xs uppercase tracking-wider">Notes</span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-xl p-4 flex flex-col justify-center items-center font-semibold">
            <span className="text-3xl font-bold mb-1">{items.filter(i => i.type === 'apikey').length}</span>
            <span className="text-xs uppercase tracking-wider">API Keys</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-12"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              className="input-field pl-10 h-12 appearance-none bg-surface"
            >
              <option value="all">All Types</option>
              <option value="password">Passwords</option>
              <option value="note">Notes</option>
              <option value="apikey">API Keys</option>
            </select>
          </div>
        </div>

        {/* Masonry-like Grid for items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl border border-borderBase border-dashed">
            <p className="text-gray-500 mb-4">No vault items found.</p>
            <button onClick={openNewItemModal} className="text-primary-600 font-medium hover:underline">
              Create your first item
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map(item => (
              <VaultItemCard 
                key={item._id} 
                item={item} 
                onDelete={handleDeleteItem} 
                onEdit={handleEditItem}
              />
            ))}
          </div>
        )}

      </main>

      <VaultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        existingItem={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
}
