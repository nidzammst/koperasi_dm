const DailyData = require('../models/dailyDataModel');
const MontlyData = require('../models/montlyDataModel');
const YearlyData = require('../models/yearlyDataModel');

const dailyDataQuery = async (queryParams) => {
  try {
    let query = {};

    // Membuat query Mongoose
    const mongooseQuery = DailyData.find(query)

    // Menangani sorting
    /* Pengunaan */
    /* {{base_url}data/daily?sort=moneyAmount, dll */
    if (queryParams.sort) {
      mongooseQuery.sort(queryParams.sort);
    }

    // Menangani paging
    /* Pengunaan */
    /* {{base_url}data/daily?page=3&pageSize=10/20 */
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

const montlyDataQuery = async (queryParams) => {
  try {
    let query = {};

    // Membuat query Mongoose
    const mongooseQuery = MontlyData.find(query)

    // Menangani sorting
    /* Pengunaan */
    /* {{base_url}data/daily?sort=moneyAmount, dll */
    if (queryParams.sort) {
      mongooseQuery.sort(queryParams.sort);
    }

    // Menangani paging
    /* Pengunaan */
    /* {{base_url}data/daily?page=3&pageSize=10/20 */
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

const yearlyDataQuery = async (queryParams) => {
  try {
    let query = {};

    // Membuat query Mongoose
    const mongooseQuery = YearlyData.find(query)

    // Menangani sorting
    /* Pengunaan */
    /* {{base_url}data/daily?sort=moneyAmount, dll */
    if (queryParams.sort) {
      mongooseQuery.sort(queryParams.sort);
    }

    // Menangani paging
    /* Pengunaan */
    /* {{base_url}data/daily?page=3&pageSize=10/20 */
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

module.exports = {
  dailyDataQuery,
  montlyDataQuery,
  yearlyDataQuery
}