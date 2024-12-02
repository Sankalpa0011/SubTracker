import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Calendar, DollarSign } from 'lucide-react';
import { Subscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const data = await response.json();
      setSubscriptions(data);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = (newSubscription: Subscription) => {
    setSubscriptions(prev => [...prev, newSubscription]);
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to delete subscription');
  
      setSubscriptions(prev => prev.filter(sub => sub._id !== id));
      toast.success('Subscription deleted successfully');
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const filteredSubscriptions = subscriptions
    .filter(sub => filter === 'all' || sub.status === filter)
    .filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.price.toString().includes(searchTerm)
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Subscription</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400" />
            <label htmlFor="filter" className="sr-only">Filter Subscriptions</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'expired')}
              className="input !w-auto"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <motion.div
                key={subscription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={subscription.logo || 'https://via.placeholder.com/48'}
                    alt={subscription.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Next renewal: {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {subscription.price}/mo
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                  <button
                    onClick={() => handleDeleteSubscription(subscription._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No subscriptions found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </motion.div>
  );
};

export default Subscriptions;