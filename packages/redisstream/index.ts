// import { createClient } from "redis";
// import { prismaClient } from "store/client";   
// const STREAM_NAME = "betteruptime:website" ;

//     // let websites=await prismaClient.website.findMany({
//     //     select:{
//     //         url:true,
//     //         id:true
//     //     }
//     // });

// const client = createClient();

// client.on("error", (err) => {
//     console.log("Redis Client Error", err);
// });

// await client.connect();

// type WebsiteEvent = {
//     url: string;
//     id: string;
// };
// type MessageType = {
//     id: string;
//     message: {
//         url: string;
//         id: string;
//     };
// };

// async function xAdd({ url, id }: WebsiteEvent) {
//     await client.xAdd(
//         STREAM_NAME,
//         "*",
//         {
//             url,
//             id
//         }
//     );
// }

// export async function xAddBulk(websites: WebsiteEvent[]) {
//     if(websites.length==0){
//         return
//     }
//     for (let i = 0; i < websites.length; i++) {
//         await xAdd({
         
//             url: websites[i]!.url,
         
//             id: websites[i]!.id
//         });
//     }
// }

// export async function xReadGroup(consumerGroup:string,workerId:string):Promise<MessageType[] | undefined>{
//    const res= await client.xReadGroup(
//     consumerGroup  ,workerId,{
//         key:STREAM_NAME,
//         id:'>'
//     },
//     {
//         'COUNT':5
        
//     }
// )
// if(!res){
//     return [];
// }

// // @ts-ignore
// const messages: MessageType[] = res[0].messages;
// if(!messages){
//     return [];
// }
// console.log(res);
// //@ts-ignore
// return res;
// }


//  async function xAck(consumerGroup:string,eventId:string){
//     await client.xAck(STREAM_NAME,consumerGroup,eventId)
// }

// export async function xAckBulk(consumerGroup:string,eventIds:string[]){
//     eventIds.map(eventId=>xAck(consumerGroup,eventId)
//     )
// }

import { createClient } from "redis";

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

type WebsiteEvent = {url: string, id: string}
type MessageType = {
    id: string,
    message: {
        url: string,
        id: string
    }
}

const STREAM_NAME = "betteruptime:website";

async function xAdd({url, id}: WebsiteEvent) {
    await client.xAdd(
        STREAM_NAME, '*', {
            url,
            id
        }
    );
}

export async function xAddBulk(websites: WebsiteEvent[]) {
    for (let i = 0; i < websites.length; i++) {
        await xAdd({
            //@ts-ignore
            url: websites[i].url,
            //@ts-ignore
            id: websites[i].id
        })
    }
}

export async function xReadGroup(consumerGroup: string, workerId: string): Promise<MessageType[] | undefined> {
    
    const res = await client.xReadGroup(
        consumerGroup, workerId, {
            key: STREAM_NAME,
            id: '>'
        }, {
        'COUNT': 5
        }
    );

    //@ts-ignore
    let messages: MessageType[] | undefined = res?.[0]?.messages;

    return messages;
}

async function xAck(consumerGroup: string, eventId: string) {
    await client.xAck(STREAM_NAME, consumerGroup, eventId)
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    eventIds.map(eventId => xAck(consumerGroup, eventId));
}