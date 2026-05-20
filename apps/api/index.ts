import express from "express";
import { prismaClient } from "store/client";
import "dotenv/config"
import { AuthInput } from "./types";
import { ca } from "zod/locales";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "./middleware";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());
app.post("/website",AuthMiddleware, async (req, res) => {
   if(!req.body.url)
    return res.status(400).json({
        message:"url is required"
    })
  const website=await prismaClient.website.create({
    data: {
      url: req.body.url,
      time_added:new Date() ,
      user_id:req.userId!
    }
  })
  res.json({
    id:website.id
  })
});

app.get("/status/:websiteId",AuthMiddleware,async(req,res) => {
   const website=await prismaClient.website.findFirst({
    where:{
      user_id:req.userId!,
      id:req.params.websiteId as string
    },
    include:{
      ticks:{
        orderBy:{
          createdAt:"desc"
        },
        take:10
      
      }
    }
   })
   if(!website){
    res.status(403).json({
      message:"website not found"
    })
    return;
   }
   return res.json({
    url:website.url,
    id:website.id,
    user_id:website.user_id,
    ticks:website.ticks
   })
    
})  

app.get("/websites",AuthMiddleware,async(req,res) => {
   const websites=await prismaClient.website.findMany({
    where:{
      user_id:req.userId!
    },
    include:{
      ticks:{
        orderBy:{
          createdAt:"desc"
        },
        take:1
      }
    }
   })
   return res.json({
    websites
   })
})

app.delete("/website/:id",AuthMiddleware,async(req,res) => {
  try {
    // Delete dependent ticks first to prevent foreign key errors
    await prismaClient.websiteTick.deleteMany({
      where: {
        website_id: req.params.id
      }
    });

    await prismaClient.website.delete({
      where: {
        id: req.params.id,
        user_id: req.userId!
      }
    });

    return res.json({
      message: "Website deleted successfully"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Failed to delete website"
    });
  }
})

app.post("/signup", async(req,res) => {
 const data=AuthInput.safeParse(req.body )  
 if(!data.success){
    return res.status(400).json({
        message:"Invalid data"
    })
 }
  try {
    const user = await prismaClient.user.create({
      data: {
        username: data.data.username,
        password: data.data.password,
      }
    })
    res.json({
      id: user.id
    })
  }
 catch (e) {
      console.log(e)
      return res.status(400).json({
        message: "Invalid data"
      })
    }
})



app.post("/signin", async(req,res) => {
 const data=AuthInput.safeParse(req.body )  
 if(!data.success){
    return res.status(400).json({
        message:"Invalid data"
    })
 }
  try {
    const user = await prismaClient.user.findUnique({
      where:{
        username:data.data.username,
      }
    })
    if(!user || user.password !== data.data.password){
      return res.status(403).json({
        message:"Invalid credentials"
      })
    }
    const token=jwt.sign({sub:user.id},process.env.JWT_SECRET!,{expiresIn:"10d"})
    res.json({
      jwt:token
    })
  }
 catch (e) {
      console.log(e)
      return res.status(400).json({
        message: "Invalid data"
      })
    }
})




app.listen(process.env.PORT || 3001, () => {
  console.log(`Server started on port ${process.env.PORT || 3001}`);
});
