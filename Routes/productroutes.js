const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Product = require("../Models/Product");

const router = express.Router();

// Initialize GridFS
let gridfsBucket;
mongoose.connection.once("open", () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads"
    });
});

// Custom Multer storage handler to upload files to GridFS
const storage = multer.memoryStorage(); // Store the file in memory temporarily

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only accept image files (add more mime types if needed)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    }
});
// Fetch Products and Display on Products Page
router.get("/products", async (req, res) => {
  try {
      // Fetch all products from the database
      const products = await Product.find();

      // Render products.ejs and pass the products to the view
      res.render("products", { products });
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
  }
});

// Create Product
router.post("/upload-product", upload.single("productImage"), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).send("No file uploaded");
      }

      console.log(req.file); // Check the uploaded file's info

      // Upload file to GridFS manually
      const filename = `${Date.now()}-${req.file.originalname}`;
      const fileStream = gridfsBucket.openUploadStream(filename);
      fileStream.write(req.file.buffer); // Write the file buffer to GridFS

      fileStream.end();

      fileStream.on("finish", async () => {
          // Once the file is uploaded, retrieve the file ID
          const imageId = fileStream.id;
          console.log("File uploaded successfully, File ID:", imageId);

          const { name, description, category, price, stock, ingredients, benefits, usageInstructions, manufacturer } = req.body;
          const image = imageId; // Use the uploaded file's ID

          // Create the product with the image ID
          const newProduct = new Product({
              name,
              description,
              category,
              price: parseFloat(price),
              stock: parseInt(stock),
              image, // Reference to the uploaded image file in GridFS
              ingredients: ingredients ? ingredients.split(",") : [],
              benefits: benefits ? benefits.split(",") : [],
              usageInstructions,
              manufacturer
          });

          await newProduct.save();
          req.flash("success", "product uploaded successfully!");
          res.redirect("/admin");
      });

      fileStream.on("error", (err) => {
          console.error("Error uploading file:", err);
          res.status(500).send("Error uploading file");
      });

  } catch (error) {
      console.error("Error uploading product:", error);
      res.status(500).send("Internal Server Error");
  }
});

// Fetch Products
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Get Image from GridFS
router.get("/image/:id", async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        // Find the file by its ID in GridFS
        const file = await gridfsBucket.find({ _id: fileId }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).send("No image found");
        }

        // Create a read stream for the file and pipe it to the response
        const readStream = gridfsBucket.openDownloadStream(fileId);
        res.set("Content-Type", file[0].contentType); // Set the correct MIME type for the image
        readStream.pipe(res);
    } catch (error) {
        console.error("Error retrieving image:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
