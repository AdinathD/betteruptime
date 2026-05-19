import { createClient } from "redis";
import axios from "axios";
import {prismaClient } from "store/client"


async function main() {
   const client = await createClient({})
        .on("error", (e) => console.log(e))
        .connect();

    while(true){ const res = await client.xReadGroup('india', 'india-1',
        {
            key: 'betteruptime:website',
            id: '>'
        }, {
        COUNT: 2
    })
    if (!res) {
        console.log("No messages");
        client.destroy();
        return;

    }
    //@ts-ignore
    // console.log(res[0].messages)

    let websitesToTrack=res[0].messages;
    websitesToTrack.forEach(website=>{
        let startTime=Date.now()
        axios.get(website.url)
        .then(()=>{
            prismaClient.websiteTick.create({
                status:"Up",
                url:website.url,
                response_time_ms:Date.now()-startTime,
                region_id:"india",
                website_id:website.id,
                
                
            })
        })
        .catch(()=>{})
    })  

    
    //  client.destroy();

   } 
}
main();