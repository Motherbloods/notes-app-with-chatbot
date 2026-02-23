const {
  requestLoginService,
  verifyLoginTokenService,
  verifyAuthService,
} = require("../services/auth.service");

const requestLogin = async (req, res) => {
  try {
    const data = await requestLoginService();
    res.status(200).json(data);
  } catch (error) {
    console.error("Request login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyLoginToken = async (req, res) => {
  try {
    const { loginToken } = req.body;
    console.log("ini loginToken", loginToken);
    const result = await verifyLoginTokenService(loginToken);

    if (result.status === "pending") {
      return res.status(202).json(result);
    }

    res.cookie("auth_token", result.jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".motherbloodss.site",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user: result.user });
  } catch (error) {
    console.error("Verify login token error:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      domain: process.env.DOMAIN,
      path: "/",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyAuth = async (req, res) => {
  try {
    const user = await verifyAuthService(req.userId);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Token verification error:", error);
    res
      .status(error.status || 401)
      .json({ error: error.message || "Invalid token" });
  }
};

module.exports = { requestLogin, verifyLoginToken, logout, verifyAuth };
