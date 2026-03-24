require("dotenv").config();
const multer = require("multer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const Complaint = require("./models/Complaint");


app.post("/report", upload.single("image"), async (req, res) => {

    try {

        const image = req.file ? req.file.filename : "";

        const complaint = new Complaint({
            category: req.body.category,
            description: req.body.description,
            location: req.body.location,
            image: image,
            status: "Submitted",
            date: new Date()
        });

        await complaint.save();

        res.json({
            message: "Complaint Submitted",
            id: complaint._id
        });

    } catch (error) {

        res.status(500).json({
            message: "Error submitting complaint"
        });

    }

});


app.get("/complaint/:id", async (req, res) => {

    const complaint = await Complaint.findById(req.params.id);

    res.json(complaint);

});


app.get("/complaints", async (req, res) => {

    const complaints = await Complaint.find();

    res.json(complaints);

});


app.put("/update/:id", async (req, res) => {

    await Complaint.findByIdAndUpdate(req.params.id,
        { status: req.body.status }
    );

    res.json({ message: "Status Updated" });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});