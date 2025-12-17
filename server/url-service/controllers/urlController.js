const Url = require("../models/Url");
const { generateShortCode, isValidUrl } = require("../utils/urlUtils");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { publishEvent } = require("../config/rabbitmq");

/**
 * Create a shortened URL
 */
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, expiresAt } = req.body;

    // Validate original URL
    if (!originalUrl) {
      return errorResponse(res, 400, "Original URL is required");
    }

    if (!isValidUrl(originalUrl)) {
      return errorResponse(res, 400, "Invalid URL format");
    }

    // Check if URL already exists
    let url = await Url.findOne({ originalUrl });
    if (url) {
      return successResponse(res, 200, "URL already exists", url);
    }

    // Generate or use custom short code
    let urlCode = customCode || generateShortCode();

    // Check if custom code already exists
    if (customCode) {
      const existingUrl = await Url.findOne({ urlCode: customCode });
      if (existingUrl) {
        return errorResponse(res, 400, "Custom short code already in use");
      }
    } else {
      // Ensure generated urlCode is unique
      let existingUrl = await Url.findOne({ urlCode });
      while (existingUrl) {
        urlCode = generateShortCode();
        existingUrl = await Url.findOne({ urlCode });
      }
    }

    // Create short URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;
    const shortUrl = `${baseUrl}/${urlCode}`;

    // Set expiry date: use client-provided or default to configured days
    const expiryDate = expiresAt || (() => {
      const date = new Date();
      const expiryDays = parseInt(process.env.DEFAULT_EXPIRY_DAYS) || 30;
      date.setDate(date.getDate() + expiryDays);
      return date;
    })();

    // Create new URL document
    url = new Url({
      originalUrl,
      shortUrl,
      urlCode,
      expiresAt: expiryDate,
    });

    await url.save();

    // Publish URL creation event
    await publishEvent('url_events', 'url.created', {
      urlCode: url.urlCode,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      expiresAt: url.expiresAt,
      timestamp: new Date().toISOString(),
    });

    return successResponse(res, 201, "Short URL created successfully", url);
  } catch (error) {
    console.error("Error creating short URL:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

/**
 * Get all URLs
 */
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    return successResponse(res, 200, "URLs retrieved successfully", {
      urls,
      count: urls.length
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
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
      return errorResponse(res, 404, "URL not found");
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return errorResponse(res, 410, "URL has expired");
    }

    // Increment click count
    url.clicks++;
    await url.save();

    // Publish URL click event
    await publishEvent('url_events', 'url.clicked', {
      urlCode: url.urlCode,
      clicks: url.clicks,
      timestamp: new Date().toISOString(),
    });

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
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
      return errorResponse(res, 404, "URL not found");
    }

    return successResponse(
      res,
      200,
      "URL statistics retrieved successfully",
      url
    );
  } catch (error) {
    console.error("Error fetching URL stats:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
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
      return errorResponse(res, 404, "URL not found");
    }

    // Publish URL deletion event
    await publishEvent('url_events', 'url.deleted', {
      urlCode: url.urlCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      timestamp: new Date().toISOString(),
    });

    return successResponse(res, 200, "URL deleted successfully", {
      deletedUrl: url,
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

module.exports = {
  createShortUrl,
  getAllUrls,
  redirectUrl,
  getUrlStats,
  deleteUrl,
};
