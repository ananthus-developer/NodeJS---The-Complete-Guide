const Product = require('../models/product');
const { validationResult } = require('express-validator/check')
const mongoose = require('mongoose');

exports.getAddProduct = (req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError:false,
    errorMessage:null,
    validationErrors:[]
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError:true,
      product: {
        title,imageUrl,price,description
      },
      errorMessage: errors.array().reduce((acc, value) => (`${acc}.\n${value.msg}`), ''),
      validationErrors:errors.array()
    });
  }
  const product = new Product({
    _id:new mongoose.Types.ObjectId('6083b92e625410317c51e4c8'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // console.log(err);
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/edit-product',
      //   editing: false,
      //   hasError:true,
      //   product: {
      //     title,imageUrl,price,description
      //   },
      //   errorMessage: 'Database exception , Please try again',
      //   validationErrors:[]
      // });

      res.redirect('/500');      
    });


};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      return res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError:false,
        errorMessage:null,
        validationErrors:[]
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      hasError:true,
      product: {
        title:updatedTitle,
        imageUrl:updatedImageUrl,
        price:updatedPrice,
        description:updatedDesc,
        _id:prodId
      },
      errorMessage: errors.array().reduce((acc, value) => (`${acc}.\n${value.msg}`), ''),
      validationErrors:errors.array()
    });
  }
  Product.findById(prodId)
    .then(product => {

      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })

    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
  // Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Product.findByIdAndRemove(prodId)
  Product.deleteOne({_id:prodId,userId:req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
