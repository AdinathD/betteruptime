import express from "express";
import { prismaClient } from "store/client";

const app = express();
app.use(express.json());
app.post("/website", async (req, res) => {
   if(!req.body.url)
    return res.status(400).json({
        message:"url is required"
    })
  const website=await prismaClient.website.create({
    data: {
      url: req.body.url,
    }
  })
  res.json({
    id:website.id
  })
});

app.get("/status/:websiteId",(req,res) => {
    
})  
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});