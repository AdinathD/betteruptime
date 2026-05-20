
// import { prismaClient } from "store/client";
// import { xAddBulk } from "redisstream/client";



// async function main(){

//     let websites=await prismaClient.website.findMany({
//         select:{
//             url:true,
//             id:true
//         }
//     });

//    console.log(websites.length)
//     await xAddBulk(websites.map(w => ({
//         url: w.url,
//         id: w.id
//     })));



// }

// setInterval(()=>{main()},3*60*1000)
// main()
import { prismaClient } from "store/client";
import { xAddBulk } from "redisstream/client";

async function main() {
    let websites = await prismaClient.website.findMany({
        select: {
            url: true,
            id: true
        }
    })

    await xAddBulk(websites.map(w => ({
        url: w.url,
        id: w.id
    })));
    console.log(websites.length);
}

setInterval(() => {
    main()
}, 3 * 1000 * 60)

main()