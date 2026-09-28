const Setting = require('../models/Setting');
const catchAsync = require('../utils/catchAsync');

const getSettings = catchAsync(async (req, res) => {
  const settings = await Setting.getSite();
  res.json({ success: true, data: settings });
});

const updateSettings = catchAsync(async (req, res) => {
  const settings = await Setting.getSite();
  if (req.body.backgroundPattern !== undefined) settings.backgroundPattern = req.body.backgroundPattern;
  await settings.save();
  res.json({ success: true, data: settings });
});

module.exports = { getSettings, updateSettings };
