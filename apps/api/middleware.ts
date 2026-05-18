import type{NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";


export function AuthMiddleware(req:Request,res:Response,next:NextFunction){
    const header=req.headers.authorization;
    if(!header){
        return res.status(403).json({
            message:"unauthorised"
        })
    }
    try{
        const decodedValue=jwt.verify(header,process.env.JWT_SECRET!);
        req.userId = decodedValue.sub as string;
        next();


    }catch(e){
        console.log(e);
        return res.status(403).json({
            message:"unauthorised"
        })
    }
}