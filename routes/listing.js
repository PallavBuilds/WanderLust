const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
// const {listingSchema}=require("../schema.js");
// const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}=require("../middleware.js");


const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});



//index and create route in router.route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));


//new route
router.get("/new",isLoggedIn, listingController.renderNewForm);

//show, update, and delete in router.route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports=router;





//index route
//router.get("/",wrapAsync(listingController.index));

//pehle index route aisa tha 
// router.get("/",wrapAsync(async(req,res)=>{
//     const allListings=await Listing.find({});
//     //console.log(allListings);
//     res.render("listings/index.ejs",{allListings});
// }))




//show route
//router.get("/:id",wrapAsync(listingController.showListing));

//create route
//router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.createListing));



//Update Route
//router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));

//Delete route
//router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



