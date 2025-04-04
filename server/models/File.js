const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalname: { type: String, required: true }, // Original file name
    filename: { type: String, required: true },    // Stored file name (e.g., in the uploads directory)
    mimetype: { type: String },                     // File type (e.g., 'image/jpeg')
    size: { type: Number },                         // File size in bytes
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Link to the customer
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to the user (for authorization)
    uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);
module.exports = File;