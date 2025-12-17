import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchUrls();
  }, [navigate]);

  const fetchUrls = async () => {
    try {
      const response = await api.get('/api/urls');
      setUrls(response.data.urls || []);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/shorten', { originalUrl });
      setUrls([response.data.url, ...urls]);
      setOriginalUrl('');
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

  const handleDelete = async (urlId) => {
    try {
      await api.delete(`/api/${urlId}`);
      setUrls(urls.filter(url => url._id !== urlId));
    } catch (err) {
      console.error('Error deleting URL:', err);
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
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
            <div className="flex gap-4">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Enter your long URL here..."
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>
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
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(url._id)}
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
