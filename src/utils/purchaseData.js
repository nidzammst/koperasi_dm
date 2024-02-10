const DailyData = require('../models/dailyDataModel');
const MontlyData = require('../models/montlyDataModel');
const YearlyData = require('../models/yearlyDataModel');
const TotalData = require('../models/totalDataModel');

const calculateData = async (history) => {
	try {
		const soldOut = history.purchasedProducts.map((hist) => {
			return { product: hist.product._id, quantity: hist.quantity };
		});
		const dailyData = await DailyData.findOneAndUpdate({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) }, {
				$inc: {
					revenueAmount: history.purchaseAmount,
					profitAmount: history.purchaseAmount / 10
				},
				$push: {
					$each: { soldOut }
				}
			}, { new: true });
		if(!dailyData) {
			const dailyData = await DailyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
				revenueAmount: history.purchaseAmount,
				profitAmount: history.purchaseAmount / 10,
				soldOut: { soldOut },
			});
		}
		console.log("dailyData", dailyData)
		const montlyData = await MontlyData.findOneAndUpdate({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) }, {
				$inc: {
					revenueAmount: history.purchaseAmount,
					profitAmount: history.purchaseAmount / 10
				},
				$push: {
					$each: { soldOut }
				}
			}, { new: true });
		if(!montlyData) {
			const montlyData = await MontlyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
				revenueAmount: history.purchaseAmount,
				profitAmount: history.purchaseAmount / 10,
				soldOut: { soldOut },
			});
		}
		console.log("montlyData", montlyData)
		const yearlyData = await YearlyData.findOneAndUpdate({ date: new Date().toLocaleDateString('en-US', { year: 'numeric' }) }, {
				$inc: {
					revenueAmount: history.purchaseAmount,
					profitAmount: history.purchaseAmount / 10
				},
				$push: {
					$each: { soldOut }
				}
			}, { new: true });
		if(!yearlyData) {
			const yearlyData = await YearlyData.create({
				date: new Date().toLocaleDateString('en-US', { year: 'numeric' }),
				revenueAmount: history.purchaseAmount,
				profitAmount: history.purchaseAmount / 10,
				soldOut: { soldOut },
			});
		}
		console.log("yearlyData", yearlyData)
		const totalData = await TotalData.findOneAndUpdate({}, {
				$inc: {
					revenueAmount: history.purchaseAmount,
					profitAmount: history.purchaseAmount / 10
				},
				$push: {
					$each: { soldOut }
				}
			}, { new: true });
		if(!totalData) {
			const totalData = await TotalData.create({
				revenueAmount: history.purchaseAmount,
				profitAmount: history.purchaseAmount / 10,
				soldOut: { soldOut },
			});
		}

		return data = {
			dailyData,
			montlyData,
			yearlyData,
			totalData
		}
	}
	catch (err) {
		throw new Error(err);
	}
}



module.exports = {
	calculateData
}