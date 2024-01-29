const mongoose = require('mongoose');
const { parse } = require('querystring');
const History = require('../models/historyModel');
const Account = require('../models/accountModel');

const getHistories = async (queryParams) => {
  try {
    let query = {};

    // Menangani filter
    // Menangani pencarian berdasarkan kata tertentu pada User
    /* Pengunaan */
    /* {base_url}transaction/payment?category=1/2/3/4 */
    if (queryParams.category) {
      const action = ["Vendor's Cash Withdrawal", "Santri's Cash Withdrawal", "Fund Transfer", "Top-Up"]
      query.action = action[parseInt(queryParams.category) - 1];
    }

    // Menangani pencarian
    /* Pengunaan */
    /* {base_url}transaction/payment?search=ahmad */
    /* {base_url}transaction/payment?fullname=nidzam */
    if (queryParams.search) {
      const searchRegExp = new RegExp(queryParams.search, 'i'); // buat search params case insensitive
      // Mencari di tabel Account berdasarkan fullname
      const accountQuery = await Account.find({ fullname: searchRegExp });
      const accountIds = accountQuery.map(account => account._id);
      query.$or = [ // menggunakan operator or agar search bisa lebih dari satu dalam satu query
        { 'account': { $in: accountIds } },
        { 'transferringAccount': { $in: accountIds } },
        { 'receivingAccount': { $in: accountIds } },
        { note: searchRegExp },
      ];
    }

    // Membuat query Mongoose
    const mongooseQuery = History.find(query)
      .populate('account')
      .populate('transferringAccount')
      .populate('receivingAccount');

    // Menangani sorting
    /* Pengunaan */
    /* {base_url}transaction/payment?sort=debitAmount/-debitAmount/transferamount */
    if (queryParams.sort) {
      mongooseQuery.sort(queryParams.sort);
    }

    // Menangani paging
    /* Pengunaan */
    /* {base_url}transaction/payment?page=3&pageSize=10/20 */
    if (queryParams.page && queryParams.pageSize) {
      mongooseQuery
        .skip((parseInt(queryParams.page) - 1) * parseInt(queryParams.pageSize))
        .limit(parseInt(queryParams.pageSize));
    }

    // Menangani proyeksi kolom
    /* Pengunaan dengan kombinasi */
    /* {base_url}transaction/payment?projection=account,action,note */
    if (queryParams.projection) {
      mongooseQuery.select(queryParams.projection);
    }

    // Eksekusi query dan dapatkan hasil
    const items = await mongooseQuery.exec();

    return items;
    /* Pengunaan dengan kombinasi */
    /*{base_url}transaction/payment?category=2&sort=debitAmount&page=3&pageSize=10&projection=account,action,note&search=Ahmad*/
  } catch (error) {
    throw error;
  }
};

module.exports = getHistories