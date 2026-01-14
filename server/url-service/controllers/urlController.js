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

    // Check if URL already exists (not deleted) for this user
    let url = await Url.findOne({ originalUrl, userId: req.user.id, deletedAt: null });
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
      userId: req.user.id,
      expiresAt: expiryDate,
    });

    await url.save();

    // Publish URL creation event
    await publishEvent('url_events', 'url.created', {
      urlCode: url.urlCode,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      userEmail: req.user.email,
      userId: req.user.id,
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
 * Get all URLs (Admin only)
 * Query params: status=active|expired|deleted
 */
const getAllUrls = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    let urls;

    if (status === 'deleted') {
      // Get soft deleted URLs
      query.deletedAt = { $ne: null };
      urls = await Url.find(query).sort({ deletedAt: -1 });
    } else if (status === 'expired') {
      // Get expired URLs (not deleted)
      query.deletedAt = null;
      query.expiresAt = { $lt: new Date() };
      urls = await Url.find(query).sort({ expiresAt: -1 });
    } else {
      // Get active URLs (not deleted, not expired)
      query.deletedAt = null;
      query.$or = [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null }
      ];
      urls = await Url.find(query).sort({ createdAt: -1 });
    }

    return successResponse(res, 200, "URLs retrieved successfully", {
      urls,
      count: urls.length,
      status: status || 'active'
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

/**
 * Get URLs for the authenticated user
 */
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id, deletedAt: null }).sort({ createdAt: -1 });
    return successResponse(res, 200, "URLs retrieved successfully", {
      urls,
      count: urls.length
    });
  } catch (error) {
    console.error("Error fetching user URLs:", error);
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
 * Delete a URL - Soft delete
 */
const deleteUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ urlCode: code, deletedAt: null });

    if (!url) {
      return errorResponse(res, 404, "URL not found");
    }

    // Check if user is the owner or an admin
    if (url.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, "You don't have permission to delete this URL");
    }

    // Soft delete by setting deletedAt timestamp
    url.deletedAt = new Date();
    await url.save();

    // Publish URL deletion event
    await publishEvent('url_events', 'url.deleted', {
      urlCode: url.urlCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      deletedBy: req.user.id,
      deletedAt: url.deletedAt.toISOString(),
      timestamp: new Date().toISOString(),
    });

    return successResponse(res, 200, "URL deleted successfully", {
      deletedUrl: { urlCode: url.urlCode, originalUrl: url.originalUrl, deletedAt: url.deletedAt },
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

/**
 * Get admin dashboard statistics
 */
const getAdminStats = async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments({ deletedAt: null });
    const deletedUrls = await Url.countDocuments({ deletedAt: { $ne: null } });
    const expiredUrls = await Url.countDocuments({
      deletedAt: null,
      expiresAt: { $lt: new Date() }
    });
    const activeUrls = await Url.countDocuments({
      deletedAt: null,
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null }
      ]
    });
    
    const totalClicks = await Url.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    return successResponse(res, 200, "Statistics retrieved successfully", {
      totalUrls,
      activeUrls,
      expiredUrls,
      deletedUrls,
      totalClicks: totalClicks[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

/**
 * Get URL count per user (admin only)
 */
const getUserUrlCounts = async (req, res) => {
  try {
    const userUrlCounts = await Url.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: { $toString: '$userId' },
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $gte: ['$expiresAt', new Date()] },
                    { $eq: ['$expiresAt', null] }
                  ]
                },
                1,
                0
              ]
            }
          },
          expiredCount: {
            $sum: {
              $cond: [
                { $lt: ['$expiresAt', new Date()] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return successResponse(res, 200, "User URL counts retrieved successfully", {
      userUrlCounts
    });
  } catch (error) {
    console.error("Error fetching user URL counts:", error);
    return errorResponse(res, 500, "Server error", { details: error.message });
  }
};

module.exports = {
  createShortUrl,
  getAllUrls,
  getUserUrls,
  redirectUrl,
  getUrlStats,
  deleteUrl,
  getAdminStats,
  getUserUrlCounts,
};
