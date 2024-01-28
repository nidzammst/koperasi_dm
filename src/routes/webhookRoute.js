const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
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
module.exports = router;