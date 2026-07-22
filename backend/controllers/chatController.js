/**
 * controllers/chatController.js
 * Thin HTTP layer for POST /chat — all business logic now lives in
 * services/chatService.js. This file's only job is: read the (already
 * validated) request, call the service, shape the HTTP response.
 */

const chatService = require('../services/chatService');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    const result = await chatService.processMessage({
      sessionId,
      message,
      userId: req.userId || null,
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
