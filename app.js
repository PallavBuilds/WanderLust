if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

console.log(process.env.SECRET);

//dns
const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const Listing=require("./models/listing.js");

const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public")));

const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);

// const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");

// const {listingSchema,reviewSchema}=require("./schema.js");
// const Review=require("./models/review.js");

const session=require("express-session");
const MongoStore = require('connect-mongo').default;

const flash=require("connect-flash");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


//for mongodb database

const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
};



// app.get("/",(req,res)=>{
//     res.send("HI, I'm root");
// })



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg=req.flash("success");
    //console.log(res.locals.successMsg);
    res.locals.errorMsg=req.flash("error");

    res.locals.currUser=req.user;
    next();
});

// app.get("/demoUser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"sigma-student"
//     });

//    let registeredUser=await User.register(fakeUser,"helloWorld");
//    res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



// app.get("/testListing",async (req,res)=>{
//     //ek document khudse insert kar rahe hai
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"BY the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });


// catch-all route
app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

// error handling middleware
app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("./listings/error.ejs",{message});
    //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});