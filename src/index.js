const express = require("express");
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = process.env.PORT || 4000
const bodyParser = require('body-parser');
const cors = require('cors')

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const dbConnect = require('./config/dbConnect');
const accountRouter = require('./routes/accountRoute');
const productRouter = require('./routes/productRoute');
const paymentRouter = require('./routes/paymentRoute');
const purchaseRouter = require('./routes/purchaseRoute');
const dataRouter = require('./routes/dataRoute');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var corsOptions = {
  origin: 'https://3000-wandering-sound-82687444.in-ws2.runcode.io/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use('/api/account', accountRouter);
app.use('/api/product', productRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/data', dataRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running at port ${PORT}`);
});

dbConnect();