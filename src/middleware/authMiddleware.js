const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const accessToken = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken) {
        return res.status(401).json({ message: "No access token" });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).json({ message: "Token expired. No refresh token found." });
        }

        try {
            const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const newAccessToken = jwt.sign(
                { userId: refreshDecoded.userId, email: refreshDecoded.email },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

            res.cookie("token", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });

            req.user = refreshDecoded;
            return next(); // allow request after refresh
        } catch (refreshErr) {
            return res.status(401).json({ message: "Refresh token invalid or expired. Login again." });
        }
    }
};
