const DailyData = require('../models/dailyDataModel');
const MontlyData = require('../models/montlyDataModel');
const YearlyData = require('../models/yearlyDataModel');
const TotalData = require('../models/totalDataModel');

const increaseMoneyData = async (history) => {
	try {
		const dailyData = await DailyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) });
		const montlyData = await MontlyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) });
		const yearlyData = await YearlyData.findOne({ date: new Date().toLocaleDateString('en-US', { year: 'numeric' }) });
		const totalData = await TotalData.findOne();

		if(dailyData) {
			dailyData.topupAmount += history.debitAmount;
			dailyData.moneyAmount += history.debitAmount
			await dailyData.save();
		} else {
			const newDailyData = await DailyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
				topupAmount: history.debitAmount,
				moneyAmount: history.debitAmount
			});
		}
		if(montlyData) {
			montlyData.topupAmount += history.debitAmount;
			montlyData.moneyAmount += history.debitAmount
			await montlyData.save();
		} else {
			const newMontlyData = await MontlyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
				topupAmount: history.debitAmount,
				moneyAmount: history.debitAmount
			});
		}
		if(yearlyData) {
			yearlyData.topupAmount += history.debitAmount;
			yearlyData.moneyAmount += history.debitAmount
			await yearlyData.save();
		} else {
			const newYearlyData = await YearlyData.create({
				date: new Date().toLocaleDateString('en-US', { year: 'numeric' }),
				topupAmount: history.debitAmount,
				moneyAmount: history.debitAmount
			});
		}
		if(totalData) {
			totalData.topupAmount += history.debitAmount;
			totalData.moneyAmount += history.debitAmount
			await totalData.save();
		} else {
			const newTotalData = await TotalData.create({
				topupAmount: history.debitAmount,
				moneyAmount: history.debitAmount
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

const decreaseMoneyData = async (history) => {
	try {
		const dailyData = await DailyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) });
		const montlyData = await MontlyData.findOne({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) });
		const yearlyData = await YearlyData.findOne({ date: new Date().toLocaleDateString('en-US', { year: 'numeric' }) });
		const totalData = await TotalData.findOne();

		if(dailyData) {
			dailyData.withdrawAmount += history.withdrawalAmount;
			await dailyData.save();
		} else {
			const newDailyData = await DailyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
				withdrawAmount: history.withdrawalAmount,
				moneyAmount: -history.withdrawalAmount
			});
		}
		if(montlyData) {
			montlyData.withdrawAmount += history.withdrawalAmount;
			await montlyData.save();
		} else {
			const newMontlyData = await MontlyData.create({
				date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
				withdrawAmount: history.withdrawalAmount,
				moneyAmount: -history.withdrawalAmount
			});
		}
		if(yearlyData) {
			yearlyData.withdrawAmount += history.withdrawalAmount;
			await yearlyData.save();
		} else {
			const newYearlyData = await YearlyData.create({
				date: new Date().toLocaleDateString('en-US', { year: 'numeric' }),
				withdrawAmount: history.withdrawalAmount,
				moneyAmount: -history.withdrawalAmount
			});
		}
		if(totalData) {
			totalData.withdrawAmount += history.withdrawalAmount;
			totalData.moneyAmount -= history.withdrawalAmount
			await totalData.save();
		} else {
			const newTotalData = await TotalData.create({
				withdrawAmount: history.withdrawalAmount,
				moneyAmount: -history.withdrawalAmount
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
	increaseMoneyData,
	decreaseMoneyData
}