const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null,  file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

const Product = require('../models/product');


router.get('/', (req, res, next) => {
  Product.find()
  .select('name price _id productImage')
  .exec()
  .then(docs => {
     const response = {
       count: docs.length,
       products: docs.map(doc => {
         return {
           name:doc.name,
           price:doc.price,
           productImage: doc.productImage,
           _id: doc._id,
           request: {
             type: 'GET',
             url:'http://loclhost:3001/products/' + doc._id
           }
         };
       })
     };
    //   if (docs.length >= 0) {
        res.status(200).json(docs);
    //   } else {
    //       res.status(404).json({
    //           message: 'No entries found'
    //       });
    //   }
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({
          error: err
        });
     });
});


//Post request  
router.post('/',checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
      _id:new mongoose.Types.ObjectId(),
       name: req.body.name,
       price: req.body.price,
       productImage: req.file.path
    });
    product
      .save()
      .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: result
         });
     })
      .catch(err  => {
          console.log(err);
          res.status(500).json({
              error: err
          });
      }); 
});


//Get request by ID 
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("From database",doc);
       if (doc) {
        res.status(200).json({
          product:doc,
          request: {
            type: 'GET',
            url: 'http://localhost:3001/products'
          }
        });    
       } else {
           res.status(404).json({message: 'No valid entry found for provided ID'});
       }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });
});




//Update  request 
router.patch('/:productId',checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for ( const ops of req.body) {
        updateOps[ops.proName] = ops.value;
    }
  Product.update({_id: id}, { $set: updateOps })
  .exec()
  .then(result => {
      console.log(result);
      res.status(200).json(result);  
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({
          error: err
      });
  });
});


// jhkjhasd


 //Delete request        
router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
  Product.remove({_id: id})
   .exec()
           .then(result => {
           res.status(200).json(result);
       })
       .catch(err => {
           console.log(err);
           res.status(500).json({
               error: err
            });
       });
});





module.exports = router;