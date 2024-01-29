const mongoose = require('mongoose');
const { parse } = require('querystring');
const Product = require('../models/productModel');
const Account = require('../models/accountModel');

const getProducts = async (queryParams) => {
  try {
    let query = {};

    // Menangani filter
    // Menangani pencarian berdasarkan kata tertentu pada User
    /* Pengunaan */
    /* {{base_url}product/products?category=makanan */
    if (queryParams.category) {
      query.category = queryParams.category
    }

    // Menangani pencarian
    /* Pengunaan */
    /* {{base_url}product/products?search=ahmad */
    /* {{base_url}product/products?fullname=nidzam */
    if (queryParams.search) {
      const searchRegExp = new RegExp(queryParams.search, 'i'); // buat search params case insensitive
      // Mencari di tabel Account berdasarkan fullname
      const accountQuery = await Account.find({ fullname: searchRegExp });
      const accountIds = accountQuery.map(account => account._id);
      query.$or = [ // menggunakan operator or agar search bisa lebih dari satu dalam satu query
        { 'vendor': { $in: accountIds } },
        { title: searchRegExp },
      ];
    }

    /* Pengunaan */
    /* {{base_url}product/products?quantity=gte:50/lt:30 */
    if (queryParams.quantity) {
      const quantityOperatorRegex = /^(gte|gt|lte|lt):(.+)$/;
      const quantityMatch = queryParams.quantity.match(quantityOperatorRegex); // check apakah cocok dengan quantityOperatorRegex misal gte:50 = true gte=50 = false

      if (quantityMatch) {
        const [fullMatch, operator, value] = quantityMatch; // otomatis dihasilkan dari quantityMatch
        const numericValue = parseInt(value);

        if (!isNaN(numericValue)) { // apakah numeric value benar
          query.quantity = {};

          if (operator === 'gte') {
            query.quantity.$gte = numericValue;
          } else if (operator === 'gt') {
            query.quantity.$gt = numericValue;
          } else if (operator === 'lte') {
            query.quantity.$lte = numericValue;
          } else if (operator === 'lt') {
            query.quantity.$lt = numericValue;
          }
        }
      }
    }

    /* Pengunaan */
    /* {{base_url}product/products?price=gte:10000/lt:10000 */
    if (queryParams.price) {
      const priceOperatorRegex = /^(gte|gt|lte|lt):(.+)$/;
      const priceMatch = queryParams.price.match(priceOperatorRegex); // check apakah cocok dengan priceOperatorRegex misal gte:50 = true gte=50 = false

      if (priceMatch) {
        const [fullMatch, operator, value] = priceMatch; // otomatis dihasilkan dari priceMatch
        const numericValue = parseInt(value);

        if (!isNaN(numericValue)) { // apakah numeric value benar
          query.price = {};

          if (operator === 'gte') {
            query.price.$gte = numericValue;
          } else if (operator === 'gt') {
            query.price.$gt = numericValue;
          } else if (operator === 'lte') {
            query.price.$lte = numericValue;
          } else if (operator === 'lt') {
            query.price.$lt = numericValue;
          }
        }
      }
    }

    /* Pengunaan */
    /* {{base_url}product/products?sold=gte:150/lt:200 */
    if (queryParams.sold) {
      const soldOperatorRegex = /^(gte|gt|lte|lt):(.+)$/;
      const soldMatch = queryParams.sold.match(soldOperatorRegex); // check apakah cocok dengan soldOperatorRegex misal gte:50 = true gte=50 = false

      if (soldMatch) {
        const [fullMatch, operator, value] = soldMatch; // otomatis dihasilkan dari soldMatch
        const numericValue = parseInt(value);

        if (!isNaN(numericValue)) { // apakah numeric value benar
          query.sold = {};

          if (operator === 'gte') {
            query.sold.$gte = numericValue;
          } else if (operator === 'gt') {
            query.sold.$gt = numericValue;
          } else if (operator === 'lte') {
            query.sold.$lte = numericValue;
          } else if (operator === 'lt') {
            query.sold.$lt = numericValue;
          }
        }
      }
    }

    // Membuat query Mongoose
    const mongooseQuery = Product.find(query)

    // Menangani sorting
    /* Pengunaan */
    /* {{base_url}product/products?sort=quantity */
    if (queryParams.sort) {
      mongooseQuery.sort(queryParams.sort);
    }

    // Menangani paging
    /* Pengunaan */
    /* {{base_url}product/products?page=3&pageSize=10/20 */
    if (queryParams.page && queryParams.pageSize) {
      mongooseQuery
        .skip((parseInt(queryParams.page) - 1) * parseInt(queryParams.pageSize))
        .limit(parseInt(queryParams.pageSize));
    }

    // Menangani proyeksi kolom
    /* Pengunaan dengan kombinasi */
    /* {{base_url}product/products?projection=account,action,note */
    if (queryParams.projection) {
      mongooseQuery.select(queryParams.projection);
    }


    // Eksekusi query dan dapatkan hasil
    const items = await mongooseQuery.exec();

    return items;
    /* Pengunaan dengan kombinasi */
    /*{{base_url}product/products?category=2&sort=debitAmount&page=3&pageSize=10&projection=account,action,note&search=Ahmad*/
  } catch (error) {
    throw error;
  }
};

module.exports = getProducts