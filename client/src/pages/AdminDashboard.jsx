import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [urls, setUrls] = useState([]);
  const [users, setUsers] = useState([]);
  const [userUrlCounts, setUserUrlCounts] = useState({});
  const [activeTab, setActiveTab] = useState('active'); // active, expired, deleted, users
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const fetchUrls = useCallback(async (status) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/urls?status=${status}`);
      setUrls(response.data.urls || []);
    } catch (err) {
      console.error('Error fetching URLs:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersResponse = await api.get('/api/auth/users');
      const fetchedUsers = usersResponse.data.users || [];
      setUsers(fetchedUsers);
      
      const urlCountsResponse = await api.get('/api/admin/user-url-counts');
      const urlCountsData = urlCountsResponse.data.userUrlCounts || [];
      const counts = {};
      urlCountsData.forEach(item => {
        // Store using the string version of the userId
        const id = String(item._id);
        counts[id] = item;
      });
      console.log('Users:', fetchedUsers);
      console.log('URL Counts:', counts);
      setUserUrlCounts(counts);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || userData === 'undefined') {
      navigate('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchStats();
      
      if (activeTab === 'users') {
        fetchUsers();
      } else {
        fetchUrls(activeTab);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, fetchStats, fetchUrls, fetchUsers, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = async (urlCode, shortUrl) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this URL?\n\n${shortUrl}\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/api/urls/${urlCode}`);
      fetchUrls(activeTab);
      fetchStats();
    } catch (err) {
      console.error('Error deleting URL:', err);
      setError(err.response?.data?.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                User View
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total URLs</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUrls}</div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-lg p-6">
              <div className="text-sm text-green-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-green-700">{stats.activeUrls}</div>
            </div>
            <div className="bg-orange-50 rounded-xl shadow-lg p-6">
              <div className="text-sm text-orange-600 mb-1">Expired</div>
              <div className="text-3xl font-bold text-orange-700">{stats.expiredUrls}</div>
            </div>
            <div className="bg-red-50 rounded-xl shadow-lg p-6">
              <div className="text-sm text-red-600 mb-1">Deleted</div>
              <div className="text-3xl font-bold text-red-700">{stats.deletedUrls}</div>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-lg p-6">
              <div className="text-sm text-blue-600 mb-1">Total Clicks</div>
              <div className="text-3xl font-bold text-blue-700">{stats.totalClicks}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => handleTabChange('active')}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'active'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active URLs ({stats?.activeUrls || 0})
            </button>
            <button
              onClick={() => handleTabChange('expired')}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'expired'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expired URLs ({stats?.expiredUrls || 0})
            </button>
            <button
              onClick={() => handleTabChange('deleted')}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'deleted'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deleted URLs ({stats?.deletedUrls || 0})
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users ({users.length || 0})
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading {activeTab === 'users' ? 'users' : 'URLs'}...</p>
            </div>
          ) : activeTab === 'users' ? (
            // Users Tab Content
            users.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URLs Generated</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Active</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => {
                      const userId = String(u._id || u.id);
                      const urlCount = userUrlCounts[userId] || {};
                      return (
                        <tr key={userId} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 text-sm text-gray-900">{u.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {urlCount.count || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            {urlCount.activeCount || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : urls.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <p className="mt-4 text-gray-600">No {activeTab} URLs found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div
                  key={url._id}
                  className={`border rounded-lg p-4 transition duration-200 ${
                    activeTab === 'expired'
                      ? 'border-orange-300 bg-orange-50'
                      : activeTab === 'deleted'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-semibold hover:text-indigo-700 truncate"
                        >
                          {url.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{url.originalUrl}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Code: {url.urlCode}</span>
                        <span>Clicks: {url.clicks || 0}</span>
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        {url.expiresAt && (
                          <span className={`font-medium ${new Date(url.expiresAt) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                            {new Date(url.expiresAt) < new Date() ? 'Expired' : `Expires: ${new Date(url.expiresAt).toLocaleDateString()}`}
                          </span>
                        )}
                        {url.deletedAt && (
                          <span className="font-medium text-red-600">
                            Deleted: {new Date(url.deletedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {activeTab !== 'deleted' && (
                      <button
                        onClick={() => handleDelete(url.urlCode, url.shortUrl)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Delete URL"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
