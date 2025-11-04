const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const Mongo_Url="mongodb://127.0.0.1:27017/wonderlust";
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
   console.log(err);
});
async function main(){
    await mongoose.connect(Mongo_Url);
}
const initDB= async ()=> {
    await Listing.deleteMany({});
     initData.data=initData.data.map((obj)=>({...obj,owner:"68d8beb4672a8d0cc8cfbcf5"}));
    await Listing.insertMany(initData.data);
    console.log("data was initalized");
}
initDB();
