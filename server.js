
// Backend: Express.js + Multer
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const QRCode = require("qrcode");

const { v4: uuidv4 } = require("uuid");

const app = express();
// const PORT = 5000;
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use("/files", express.static(path.join(__dirname, "uploads")));

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload route
// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
//   const fileUrl = `${BASE_URL}/files/${req.file.filename}`;

//   res.json({ success: true, link: fileUrl });
// });

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
  const fileUrl = `${BASE_URL}/files/${req.file.filename}`;

  try {
    const qr = await QRCode.toDataURL(fileUrl); // generates base64 QR image
    res.json({ success: true, link: fileUrl, qrCode: qr });
  } catch (err) {
    console.error("Error generating QR:", err);
    res.status(500).json({ success: false, message: "Error generating QR" });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
