import { createClient } from "redis";
import { prismaClient } from "store/client";    

    // let websites=await prismaClient.website.findMany({
    //     select:{
    //         url:true,
    //         id:true
    //     }
    // });

const client = createClient();

client.on("error", (err) => {
    console.log("Redis Client Error", err);
});

await client.connect();

type WebsiteEvent = {
    url: string;
    id: string;
};

async function xAdd({ url, id }: WebsiteEvent) {
    await client.xAdd(
        "betteruptime:website",
        "*",
        {
            url,
            id
        }
    );
}

export async function xAddBulk(websites: WebsiteEvent[]) {
    if(websites.length==0){
        return
    }
    for (let i = 0; i < websites.length; i++) {
        await xAdd({
         
            url: websites[i]!.url,
         
            id: websites[i]!.id
        });
    }
}