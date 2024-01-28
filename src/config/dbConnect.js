const { default: mongoose } = require('mongoose')

const dbConnect = () => {
	try {
		const conn=mongoose.connect(`${process.env.MONGODB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true })
		console.log("Database Connected successfully")
	}
	catch (err) {
		console.log("Database error")
	}
}

module.exports=dbConnect