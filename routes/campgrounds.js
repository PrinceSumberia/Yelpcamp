var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware  = require("../middleware");



//INDEX - show all campgrounds.
router.get("/", function(req, res){
    // Get all the camgrounds from DB
    Campground.find({}, function(err, allCamgrounds){
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:allCamgrounds});
        }
    });
});

//CREATE - add new campground to the DB. 
router.post("/", isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    // Create a new campground and save it to the database
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});


// NEW - show form to create new campgrounds
router.get("/new", isLoggedIn,function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with the provided id
    // Campground.FindById(id, callback)
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
       if (err || !foundCampground) {
           req.flash("error", "Campground not found");
           res.redirect("back");
       } else {
           //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
    
    // //render the show template with that campground
    // res.render("show");
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    // redirect somewhere (show page)
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// middleware
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}


module.exports = router;
