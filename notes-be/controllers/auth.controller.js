const {
  requestLoginService,
  verifyLoginTokenService,
  verifyAuthService,
  loginWithGoogleService,
} = require("../services/auth.service");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(process.env.NODE_ENV === "production" && {
    domain: ".motherbloodss.site",
  }),
};

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

    res.cookie("auth_token", result.jwtToken, cookieOptions);

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
    res.clearCookie("auth_token", cookieOptions);
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
const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: "Google ID token is required",
      });
    }

    const { user, token } = await loginWithGoogleService(idToken);

    res.cookie("auth_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message);

    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  requestLogin,
  verifyLoginToken,
  logout,
  verifyAuth,
  loginGoogle,
};
