const { confirmLoginService } = require("../services/telegram.service");

const confirmLogin = async (req, res) => {
  try {
    const result = await confirmLoginService(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Confirm login error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = { confirmLogin };
