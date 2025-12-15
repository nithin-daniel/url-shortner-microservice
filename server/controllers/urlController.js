const Url = require('../models/Url');
const { generateShortCode, isValidUrl } = require('../utils/urlUtils');

/**
 * Create a shortened URL
 */
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, expiresAt } = req.body;

    // Validate original URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists
    let url = await Url.findOne({ originalUrl });
    if (url) {
      return res.status(200).json(url);
    }

    // Generate or use custom short code
    let urlCode = customCode || generateShortCode();

    // Ensure urlCode is unique
    let existingUrl = await Url.findOne({ urlCode });
    while (existingUrl) {
      urlCode = generateShortCode();
      existingUrl = await Url.findOne({ urlCode });
    }

    // Create short URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/${urlCode}`;

    // Create new URL document
    url = new Url({
      originalUrl,
      shortUrl,
      urlCode,
      expiresAt: expiresAt || null,
    });

    await url.save();

    res.status(201).json(url);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all URLs
 */
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.status(200).json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Redirect to original URL
 */
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ urlCode: code });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'URL has expired' });
    }

    // Increment click count
    url.clicks++;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get URL statistics
 */
const getUrlStats = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ urlCode: code });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.status(200).json(url);
  } catch (error) {
    console.error('Error fetching URL stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a URL
 */
const deleteUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOneAndDelete({ urlCode: code });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.status(200).json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createShortUrl,
  getAllUrls,
  redirectUrl,
  getUrlStats,
  deleteUrl,
};
