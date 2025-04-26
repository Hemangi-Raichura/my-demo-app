const express = require("express");
const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");

const app = express();
const port = 5000;

// Setup Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Serve the Excel file
app.get("/api/excel", (req, res) => {
  const filePath = path.join(__dirname, "../public/apiData.xlsx");
  res.sendFile(filePath);
});

// Endpoint to handle uploaded Excel file
app.post("/api/upload", upload.single("excel"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Read and process the uploaded Excel file
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert Excel data to JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  
  // Save processed data or do any further operations
  console.log(jsonData);  // You can log or save the data as needed.

  res.status(200).send("File uploaded and processed successfully!");
});

// Serve the uploads folder statically for testing
app.use("/uploads", express.static("uploads"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
