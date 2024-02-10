const Product = require('../models/productModel');
const Vendor = require('../models/vendorModel');

async function updateProducts(convertibleProducts) {
  try {
    const products = await Promise.all(convertibleProducts.map(async (prod) => {
      try {
        const result = await Product.findById(prod);
        const product = await Product.findByIdAndUpdate(prod, { soldQuantity: 0 }, { new: true });

        return result;
      } catch (error) {
        console.error(`Error updating product with ID ${prod}: ${error.message}`);
        throw error; // Anda dapat memilih untuk menangani kesalahan dengan cara yang berbeda berdasarkan kebutuhan Anda
      }
    }));
    const withdrawalAmount = products.reduce((acc, prod) => {
      return acc + prod.vendorPrice * prod.soldQuantity;
    }, 0);

    const convertedProducts = products.map((prod) => {
      const product = {
        product: prod._id,
        soldQuantity: prod.soldQuantity
      }
      return product;
    })
    
    return { withdrawalAmount, convertedProducts, products };
  } catch (error) {
    console.error(`Error updating products: ${error.message}`);
    throw error; // Anda dapat memilih untuk menangani kesalahan dengan cara yang berbeda berdasarkan kebutuhan Anda
  }
}

async function updateData(purchasedProducts) {
  try {
    const products = await Promise.all(purchasedProducts.map(async (prod) => {
      try {
        const decQuant = await Product.findByIdAndUpdate(prod.product, {
          $inc: {
            quantity: -prod.quantity,
            sold: prod.quantity
          }
        }, { new: true })

        const incVendorBalance = await Vendor.findByIdAndUpdate(decQuant.vendor._id, {
          $inc: { balance: decQuant.vendorPrice * prod.quantity }
        })
        const data = { decQuant, incVendorBalance }
        return data;
      } catch (error) {
        console.error(`Error updating product with ID ${prod}: ${error.message}`);
        throw error;
      }
    }));
    return products;
  } catch (error) {
    console.error(`Error updating products: ${error.message}`);
    throw error;
  }
}

module.exports = {
  updateProducts,
  updateData,
}
