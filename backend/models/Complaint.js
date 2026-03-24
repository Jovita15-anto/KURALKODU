const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({

    category: String,

    description: String,

    location: String,

    image: String,

    status: {
        type: String,
        default: "Submitted"
    },

    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Complaint", ComplaintSchema);