


// // Backend: Express.js + Multer
// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const path = require("path");
// const QRCode = require("qrcode");

// const { v4: uuidv4 } = require("uuid");

// const app = express();
// // const PORT = 5000;
// const PORT = process.env.PORT || 5000;


// const pinMap = new Map();   // pin → filename

// function genPin() {
//   let pin;
//   do {
//     pin = Math.floor(Math.random() * 100000)
//                .toString()
//                .padStart(5, "0");
//   } while (pinMap.has(pin));
//   return pin;
// }


// app.use(cors());
// app.use("/files", express.static(path.join(__dirname, "uploads")));

// // Setup Multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const uniqueName = uuidv4() + ext;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage });

// // Upload route
// // app.post("/upload", upload.single("file"), (req, res) => {
// //   if (!req.file) {
// //     return res.status(400).json({ success: false, message: "No file uploaded" });
// //   }

// //   const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// //   const fileUrl = `${BASE_URL}/files/${req.file.filename}`;

// //   res.json({ success: true, link: fileUrl });
// // });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
//   const fileUrl = `${BASE_URL}/files/${req.file.filename}`;

//   const pin = genPin();
//   pinMap.set(pin, req.file.filename);

//   return res.json({
//     success: true,
//     link: fileUrl,
//     pin // <<< NEW
//   });

//   try {
//     const qr = await QRCode.toDataURL(fileUrl); // generates base64 QR image
//     res.json({ success: true, link: fileUrl, qrCode: qr });
//   } catch (err) {
//     console.error("Error generating QR:", err);
//     res.status(500).json({ success: false, message: "Error generating QR" });
//   }
// });

// app.get("/download/:pin", (req, res) => {
//   const { pin } = req.params;
//   const filename = pinMap.get(pin);
//   if (!filename) {
//     return res.status(404).send("PIN not found or expired");
//   }
//   // either redirect to the static files route:
//   return res.redirect(`${process.env.BASE_URL || `http://localhost:${PORT}`}/files/${filename}`);
//   // —or stream it yourself:
//   // return res.sendFile(path.join(__dirname, "uploads", filename));
// });



// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


// Backend: Express.js + Multer
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory map: PIN -> filename
const pinMap = new Map();

// Generate a unique 5-digit PIN
function genPin() {
  let pin;
  do {   
    pin = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
  } while (pinMap.has(pin));
  return pin;
}

app.use(cors());
app.use("/files", express.static(path.join(__dirname, "uploads")));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});
const upload = multer({ storage });

// Upload route with PIN generation
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
  const fileUrl = `${BASE_URL}/files/${req.file.filename}`;

  const Pin = genPin();
  pinMap.set(Pin, req.file.filename);

  return res.json({
    success: true,
    link: fileUrl,
    pin:Pin,
  });
});

// Download by PIN route
app.get("/download/:pin", (req, res) => {
  const { pin } = req.params;
  const filename = pinMap.get(pin);
  if (!filename) {
    return res.status(404).send("PIN not found or expired");
  }
  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
  return res.redirect(`${BASE_URL}/files/${filename}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
