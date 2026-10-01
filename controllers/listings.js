const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    //console.log(allListings);
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    //console.log(req.user);
    // if(!req.isAuthenticated()){
    //     req.flash("error","You must be logged in to create listing!");
    //     return res.redirect("/login");
    // }
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});

};

module.exports.createListing=async(req,res,next)=>{
    //let {title,description,image,price,country,location}=req.body;
        
        // if(!req.body.listing){
        //     throw new ExpressError(400,"send valid data for listing");
        // }
         let response=await geocodingClient.forwardGeocode({
            query: req.body.listing.location ,
            limit: 1,
            })
        .send();
           
        
        let url=req.file.path;
        let filename=req.file.filename;
       //console.log(url,"..",filename);
        const newListing=new Listing(req.body.listing);

        //console.log(req.user);

        newListing.image={url, filename};
        newListing.owner=req.user._id;

        newListing.geometry=response.body.features[0].geometry;

        let savedListing=await newListing.save();
        console.log(savedListing);
        
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/uplaod","/uplaod/h_220,w_350");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

// original one
// module.exports.updateListing=async(req,res)=>{
//     // if(!req.body.listing){
//     //         throw new ExpressError(400,"send valid data for listing");
//     // }
//     let {id} = req.params;
    
//     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

//     if(typeof req.file !=="undefined"){
//         let url=req.file.path;
//         let filename=req.file.filename;
//         listing.image={url, filename};
//         await listing.save();
//     }
//     req.flash("success","Listing Updated!");
//     res.redirect(`/listings/${id}`);  //to redirect on show route 
// };

// updated one 
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // Get coordinates for the new location
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    // Update listing + new geometry
    let listing = await Listing.findByIdAndUpdate(
        id,
        {
            ...req.body.listing,
            geometry: response.body.features[0].geometry,
        },
        { new: true }
    );

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};