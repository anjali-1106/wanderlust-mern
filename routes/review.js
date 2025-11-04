const express= require("express");
const router=express.Router({mergeParams:true});  
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require('../schema.js');
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const{isLoggedIn,isReviewAuthor}=require("../middleware.js");


const validateListing =(req,res,next)=>{
 let {error}=listingSchema.validate(req.body);
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,error);
   }else{
    next();
   }
   };

  const reviewController=require("../controllers/review.js");

//Reviews
//post route
router.post("/", isLoggedIn,wrapAsync(reviewController.createReviewe));/*async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;    //user login vahi
    listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();
     req.flash("sucess","new review is created");
     res.redirect(`/listings/${listing._id}`);
     //console.log("new review saved");
     //res.send("sucessfully save");
}));*/
//Delete route for review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,reviewController.destroyReview);/*async(req,res)=>{
    let {id,reviewId}=req.params;
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);
   req.flash("sucess","review is deleted");
   res.redirect(`/listings/${id}`);
});*/
 module.exports=router;
