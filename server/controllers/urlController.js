const Url = require("../models/Url");
const { generateShortCode, isValidUrl } = require("../utils/urlUtils");
const { successResponse, errorResponse } = require("../utils/responseHandler");

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

    // Check if URL already exists (not deleted)
    let url = await Url.findOne({ originalUrl, deletedAt: null });
    if (url) {
      return successResponse(res, 200, "URL already exists", url);
    }

    // Generate or use custom short code
    let urlCode = customCode || generateShortCode();

    // Check if custom code already exists (not deleted)
    if (customCode) {
      const existingUrl = await Url.findOne({ urlCode: customCode, deletedAt: null });
      if (existingUrl) {
        return errorResponse(res, 400, "Custom short code already in use");
      }
    } else {
      // Ensure generated urlCode is unique (not deleted)
      let existingUrl = await Url.findOne({ urlCode, deletedAt: null });
      while (existingUrl) {
        urlCode = generateShortCode();
        existingUrl = await Url.findOne({ urlCode, deletedAt: null });
      }
    }

    // Create short URL
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const shortUrl = `${baseUrl}/${urlCode}`;

    // Set expiry date: use client-provided or default to 1 month from now
    const expiryDate = expiresAt || (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
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
    const urls = await Url.find({ deletedAt: null }).sort({ createdAt: -1 });
    return successResponse(res, 200, "URLs retrieved successfully", urls);
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
 * Delete a URL - Soft delete
 */
const deleteUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ urlCode: code, deletedAt: null });

    if (!url) {
      return errorResponse(res, 404, "URL not found");
    }

    // Soft delete by setting deletedAt timestamp
    url.deletedAt = new Date();
    await url.save();

    return successResponse(res, 200, "URL deleted successfully", {
      deletedUrl: { urlCode: url.urlCode, originalUrl: url.originalUrl, deletedAt: url.deletedAt },
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
