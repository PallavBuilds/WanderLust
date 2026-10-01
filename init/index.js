const mongoose =require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

//yaha pe toh phirse connect karna parega database se as we are performing operations like insertion and deletion
main()
.then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB=async ()=>{
    await Listing.deleteMany({});//to delete existing data jo maine likha tha //goa waala..
    initData.data=initData.data.map((obj)=>({...obj, owner:"6a8dc98eecbd6711c9dd9d4d"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();
