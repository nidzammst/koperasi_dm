const express = require("express");
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = process.env.PORT || 4000
const bodyParser = require('body-parser')

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const dbConnect = require('./config/dbConnect');
const accountRouter = require('./routes/accountRoute');
const productRouter = require('./routes/productRoute');
const transactionRouter = require('./routes/transactionRoute');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/account', accountRouter);
app.use('/api/product', productRouter);
app.use('/api/transaction', transactionRouter);

app.use(notFound);
app.use(errorHandler);
app.use(express.json()); // Memastikan aplikasi dapat membaca body JSON

app.post('/webhook', (req, res) => {
  // Lakukan verifikasi keamanan (gunakan secret, tanda tangan, dll. sesuai kebutuhan)

  // Jalankan perintah git fetch
  exec('git fetch', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error during git fetch: ${err}`);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Git fetch successful');
      res.status(200).send('OK');
    }
  });
});

app.listen(PORT, () => {
	console.log(`Server running at port ${PORT}`);
})

dbConnect();