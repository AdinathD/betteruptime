// import { createClient } from "redis";
// import axios from "axios";
// import { prismaClient } from "store/client"
// import { xAckBulk, xReadGroup } from "redisstream/client";


// const REGION_ID = process.env.REGION_ID as string;
// const WORKER_ID = process.env.WORKER_ID as string;


// async function main() {
//     // while(true){
//     const response = await xReadGroup(REGION_ID, WORKER_ID);

//     if(!response){
//         return; 
//     }
//     let promises=response.map(({ message }) => {
//          fetchWebsiteStatus(message.url,message.id)

//     })

//     await Promise.all(promises);
//     console.log(promises.length);



//     xAckBulk(REGION_ID, response.map(({id})=>id)); //id is redis stream id here in this line only
//     // }
// }

// async function fetchWebsiteStatus (url:string,websiteId:string){
//     return new Promise<void>((resolve, reject) => {


//             const startTime = Date.now();

//             axios.get(url)
//                 .then(async () => {
//                     const endTime = Date.now();
//                     const response_time_ms = endTime - startTime;
//                     await prismaClient.websiteTick.create({
//                         data: {
//                             response_time_ms,
//                             status: "Up",
//                             region_id: REGION_ID,
//                             website_id: websiteId
//                         }
//                     })
//                     resolve()

//                 }).catch(async () => {
//                     const endTime = Date.now();
//                     const response_time_ms=endTime-startTime;
//                     await prismaClient.websiteTick.create({
//                         data:{
//                             status:"Down",
//                             region_id:REGION_ID,
//                             website_id:websiteId,
//                             response_time_ms
//                         }
//                     })
//                     resolve()

//                 })

//         })
// }
// main();
import axios from "axios";
import { xAckBulk, xReadGroup } from "redisstream/client";
import { prismaClient } from "store/client";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) {
    throw new Error("Region not provided");
}

if (!WORKER_ID) {
    throw new Error("Region not provided");
}

async function main() {
    while(1) {
        const response = await xReadGroup(REGION_ID, WORKER_ID);

        if (!response) {
            continue;
        }

        let promises = response.map(({message}) => fetchWebsite(message.url, message.id))
        await Promise.all(promises);
        console.log(promises.length);

        xAckBulk(REGION_ID, response.map(({id}) => id));
    }
}

async function fetchWebsite(url: string, websiteId: string) {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        axios.get(url)
            .then(async () => { 
                const endTime = Date.now();
                await prismaClient.websiteTick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Up",
                        region_id: REGION_ID,
                        website_id: websiteId
                    }
                })
                resolve()
            })
            .catch(async () => {
                const endTime = Date.now();
                await prismaClient.websiteTick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Down",
                        region_id: REGION_ID,
                        website_id: websiteId
                    }
                })
                resolve()
            })
    })
}

main();