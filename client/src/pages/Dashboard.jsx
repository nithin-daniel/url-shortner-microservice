import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUrls = useCallback(async () => {
    try {
      const response = await api.get('/api/urls/my');
      setUrls(response.data.urls || []);
    } catch (err) {
      console.error('Error fetching URLs:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        // Token might be invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData || userData === 'undefined') {
      navigate('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
      fetchUrls();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, fetchUrls]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { originalUrl };
      if (customCode.trim()) {
        payload.customCode = customCode.trim();
      }
      if (expiryDate) {
        payload.expiresAt = new Date(expiryDate).toISOString();
      }
      
      const response = await api.post('/api/shorten', payload);
      setUrls([response.data, ...urls]);
      setOriginalUrl('');
      setCustomCode('');
      setExpiryDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
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
      setUrls(urls.filter(url => url.urlCode !== urlCode));
    } catch (err) {
      console.error('Error deleting URL:', err);
      setError(err.response?.data?.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
                >
                  Admin Panel
                </button>
              )}
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
        {/* Shorten URL Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shorten a URL</h2>
          <form onSubmit={handleShorten} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* URL Input */}
            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Long URL <span className="text-red-500">*</span>
              </label>
              <input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Custom Code (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Short Code <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  id="customCode"
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="my-custom-link"
                  pattern="[a-zA-Z0-9_-]*"
                  title="Only letters, numbers, hyphens, and underscores allowed"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated code</p>
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  id="expiryDate"
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 30 days from now</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
        </div>

        {/* URL List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your URLs</h2>
          {urls.length === 0 ? (
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
              <p className="mt-4 text-gray-600">No URLs yet. Create your first shortened URL above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div
                  key={url._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:text-blue-700 truncate"
                        >
                          {url.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{url.originalUrl}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Clicks: {url.clicks || 0}</span>
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        {url.expiresAt && (
                          <span className={`font-medium ${new Date(url.expiresAt) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                            {new Date(url.expiresAt) < new Date() ? 'Expired' : `Expires: ${new Date(url.expiresAt).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(url.urlCode, url.shortUrl)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete URL"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
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

export default Dashboard;
