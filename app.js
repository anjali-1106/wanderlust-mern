const express= require("express");
const MongoStore = require('connect-mongo');
const app= express();
const mongoose= require("mongoose");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require('./schema.js');
const Review=require("./models/review.js");
//const review = require("./models/review.js");
const session= require("express-session");
const flash=require("connect-flash");
const passport =require("passport");
const LocalStrategy =require("passport-local")
const User =require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");
const {isOwner}=require("./middleware.js");
const env=require("dotenv").config();

const listingController=require("./controllers/listings.js");

const listingRouter= require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter= require("./routes/user.js");
const { equal } = require("joi");

//const Mongo_Url="mongodb://127.0.0.1:27017/wonderlust";
const dbUrl=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
   console.log(err);
});
async function main(){
    await mongoose.connect(dbUrl);
    //await mongoose.connect(Mongo_Url);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());

const store= MongoStore.create({
     mongoUrl: dbUrl,
     crypto: {
        secret:process.env.SECRET,
     },
     touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    Cookie:{
        expires:Date.now()+7 * 24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};


//app.get("/",(req,res)=>{
   // res.send("Am i root path");
//});


app.use(session(sessionOptions));  //session is alredy ocquire
app.use(flash());

//we used session for when user open website in diff browser so we not every time login and sign up user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  // used in passport stretegy

passport.serializeUser(User.serializeUser()); //user related info is stores in mongoose means serialize
passport.deserializeUser(User.deserializeUser()); // means info is remove

app.use((req,res,next)=>{
    res.locals.sucess=req.flash("sucess");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
/*app.get("/demouser", async(req,res)=>{
    let fakeUser= new User({
        email:"student@gmail.com",
        username:"sigma-student",
    });
    let registerUser= await User.register(fakeUser,"hello");  //to store password hello
    console.log(registerUser);
})*/

const validateListing =(req,res,next)=>{
 let {error}=listingSchema.validate(req.body);
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,error);
   }else{
    next();
   }
   };

   //app.use("/listing",listings);
/*const validateReview=(req,res,next)=>{
 let {error}=reviewSchema.validate(req.body);
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,error);
   }else{
    next();
   }
   };*/



//Index Route
app.get("/listing",listingController.index);/*,async(req,res)=>{
  const allListings= await Listing.find({});
   res.render("index.ejs",{allListings});
});*/


//New Route
app.get("/listing/new",isLoggedIn,listingController.renderNewForm);/*(req,res)=>{
    res.render("new.ejs");
});*/


//Show Route
app.get("/listings/:id",listingController.showListing);/*async(req,res)=>{
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
});*/
 
//create route
 /*app.post("/listing",async(res,req)=>{
    //let {title,description,image,price,location,country}=req.body;
   const listing=req.body;
   console.log(listing);
});*/

app.post("/listings", upload.none(), isLoggedIn,listingController.createListing);// /*async (req, res) => {
  //console.log(req.body); // check this - it should now have title
  /*try {
    const listing = new Listing(req.body.listing);
    listing.owner=req.user._id;
    await listing.save();
  // res.send("Listing created successfully!");
  req.flash("sucess","new listing is created");
   res.redirect("/listing");
  } catch (err) {
    res.send(err.message);
  }
});*/

//Edit route
app.get("/listings/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));/*async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   if(!listing){
    req.flash("error","Listing u requested is not exist!");
    res.redirect("/listing");
   }
   res.render("edit.ejs",{listing});
}));*/

//update route
app.put("/listings/:id",isLoggedIn,isOwner,listingController.updateListing);/*async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   req.flash("sucess","Listing updated!");
   res.redirect(`/listings/${id}`);
});*/
//Delete route
app.delete("/listings/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));/*async(req,res)=>{
    let {id}=req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("sucess","listing is deleted");
    res.redirect("/listing");
}));*/

app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//Reviews
//post route
/*app.post("/listings/:id/reviews",wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();
     res.redirect(`/listings/${listing._id}`);
     //console.log("new review saved");
     //res.send("sucessfully save");
}));
//Delete route for review
app.delete("/listings/:id/reviews/:reviewId",async(req,res)=>{
    let {id,reviewId}=req.params;
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);
   res.redirect(`/listings/${id}`);
});*/

/*app.get("/testlist",async(req,res)=>{
 let sampleListing=new Listing({
    title:"My new villah",
    description:"By the beach",
    price:12000,
    location:"Mumbai",
    country:"India",
 });
 await sampleListing.save();
 console.log("sample was save");
 res.send("Sucessful testing");
});*/
/*app.all("/./",(req,res,next)=>{ 
    console.log("catch all route executed");
    next(new ExpressError(404,"Page not found!"));
 });*/
//app.use((err,req,res,next)=>{
   // if(err instanceof ExpressError){
    //const{statusCode=500,message="Something went wrong"}=err;
   // res.render("error.ejs",{err});
  // res.status(statusCode).send(message);
  // }else{
      //res.status(404).send("page not found");
  // }
//});
/*app.use((err,req,res,next)=>{
    res.send("something went wrong");
});*/
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});