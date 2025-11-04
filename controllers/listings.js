 const Listing=require("../models/listing");

 module.exports.index= async(req,res)=>{
  const allListings= await Listing.find({});
   res.render("index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
   const listing= await Listing.findById(id)
   .populate({
    path:"reviews",
    populate:{
        path:"author",
    },
   })
   .populate("owner");
   if(!listing){
    req.flash("error","Listing u requested is not exist!");
    res.redirect("/listing");
   }
   console.log(listing);
   res.render("show.ejs",{listing});
};

module.exports.createListing=async (req, res) => {
  //console.log(req.body); // check this - it should now have title
  try {
    const listing = new Listing(req.body.listing);
    listing.owner=req.user._id;
    await listing.save();
  // res.send("Listing created successfully!");
  req.flash("sucess","new listing is created");
   res.redirect("/listing");
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.editListing=async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   if(!listing){
    req.flash("error","Listing u requested is not exist!");
    res.redirect("/listing");
   }
   res.render("edit.ejs",{listing});
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   req.flash("sucess","Listing updated!");
   res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("sucess","listing is deleted");
    res.redirect("/listing");
};
