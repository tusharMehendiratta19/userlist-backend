const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/profileImages/"); // store in /uploads/profileImages
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + ext);
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
};

module.exports = multer({ storage, fileFilter });
