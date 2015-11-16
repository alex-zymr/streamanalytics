var express = require('express');
var router = express.Router();

/* GET /partials/bucket */
router.get('/buckets', function(req, res, next) {
  res.render('buckets', { title: 'Event Hubs & Stream Analytics Demo' });
});

/* GET /partials/chart */
router.get('/chart', function(req, res, next) {
  res.render('chart', { title: 'Event Hubs & Stream Analytics Demo' });
});

/* GET /partials/search */
router.get('/search', function(req, res, next) {
  res.render('search', { title: 'Event Hubs & Stream Analytics Demo' });
});

/* GET /partials/home */
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'Event Hubs & Stream Analytics Demo' });
});

module.exports = router;
