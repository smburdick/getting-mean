var express = require('express');
var router = express.Router();
// var ctrlMain = require('../controllers/main');
// require controller files
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* Locations pages */
// define location routes and map them to controller functions
router.get('/', ctrlLocations.homelist);
router.get('/locations/:locationid', ctrlLocations.locationInfo);
router.get('/locations/:locationid/reviews/new', ctrlLocations.addReview);
router.post('/locations/:locationid/reviews/new', ctrlLocations.doAddReview);
// var homepageController = function (req, res) {
//   res.render('index',{title:'Express'});
// };

/* GET 'home' page */
module.exports.index = function(req,res){
  res.render('index',{title: 'Express'})
}

/*Other pages */
// define other routes
router.get('/about', ctrlOthers.about);

module.exports = router;
