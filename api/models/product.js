const mongoose =require('mongoose');

const productSchema = mongoose.Schema({

    name: { type: String },
    price: { type: Number},
    productImage: { type: String, require: true}
});
module.exports = mongoose.model('Product', productSchema);
