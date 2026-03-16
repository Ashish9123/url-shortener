const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const cors = require("cors");

const Url = require("./models/Url");

const app = express();

/* Middleware */

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* MongoDB Connection */

mongoose.connect("mongodb://127.0.0.1:27017/urlshortener")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* Home Page */

app.get("/", (req,res)=>{
res.sendFile(__dirname + "/public/index.html");
});

/* Create Short URL */

app.post("/shorten", async (req,res)=>{

try{

const { originalUrl } = req.body;

if(!originalUrl){
return res.status(400).json({error:"URL required"});
}

const shortCode = shortid.generate();

const url = new Url({
originalUrl,
shortCode
});

await url.save();

res.json({
shortUrl:`http://localhost:5000/${shortCode}`
});

}catch(err){

console.log(err);
res.status(500).json({error:"Server error"});

}

});

/* Redirect */

app.get("/:code", async (req,res)=>{

const url = await Url.findOne({
shortCode:req.params.code
});

if(url){

url.clicks++;
await url.save();

return res.redirect(url.originalUrl);

}

res.status(404).send("URL not found");

});

/* Analytics */

app.get("/stats/:code", async (req,res)=>{

const url = await Url.findOne({
shortCode:req.params.code
});

if(!url){
return res.status(404).json({error:"URL not found"});
}

res.json({
originalUrl:url.originalUrl,
shortCode:url.shortCode,
clicks:url.clicks,
createdAt:url.createdAt
});

});

/* Start Server */

app.listen(5000,()=>{
console.log("Server running on port 5000");
});