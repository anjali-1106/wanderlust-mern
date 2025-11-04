const express= require("express");
const router=express.Router();  
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema ,reviewSchema}=require('../schema.js');
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");

const validateListing =(req,res,next)=>{
 let {error}=listingSchema.validate(req.body);
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,error);
   }else{
    next();
   }
   };

//Index Route
router.get("/",async(req,res)=>{
  const allListings= await Listing.find({});
   res.render("index.ejs",{allListings});
});
//New Route
router.get("/new",(req,res)=>{
    res.render("new.ejs");
});
//Show Route
router.get("/:id",async(req,res)=>{
    let {id}=req.params;
   const listing= await Listing.findById(id).populate("reviews");
   res.render("show.ejs",{listing});
});
//create route
 router.post("/listings", /*upload.none(),*/ async (req, res) => {
  //console.log(req.body); // check this - it should now have title
  try {
    const listing = new Listing(req.body.listing);
    await listing.save();
   // res.send("Listing created successfully!");
   res.redirect("/listing");
  } catch (err) {
    res.send(err.message);
  }
});
//Edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   res.render("edit.ejs",{listing});
}));
//update route
router.put("/:id",async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listing/${id}`);
});
//Delete route
router.delete("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listing");
}));

//module.exports=router;
