  const Listing=require("../models/listing");
  const Review=require("../models/review");
  
  module.exports.createReviewe=async(req,res)=>{
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
};

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);
   req.flash("sucess","review is deleted");
   res.redirect(`/listings/${id}`);
};