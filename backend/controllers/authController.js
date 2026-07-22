/**
 * controllers/authController.js
 */

const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};
