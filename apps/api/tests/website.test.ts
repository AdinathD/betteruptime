import {describe, it,expect, beforeAll} from "bun:test";
import axios from "axios"
import { createUser } from "./testUtils";
import { BACKEND_URL } from "../config";
// let BASE_URL="http://localhost:3000";
  


describe("Website gets created", () => {
    let token:string,userId:string; 
    beforeAll(async () => {
        const data=await createUser();
        token=data.jwt;
        userId=data.id
    });
    it("Website not created if url is not present", async () => {
        try {
            await axios.post(`${BACKEND_URL}/website`, {
            },{
                headers:{
                    authorization:token
                }
            });

            expect(false, "Website created when it shouldnt");
        } catch (e) {

        }
    })
    it("Website is created if url is present",async () => {
        try{const response=await axios.post(`${BACKEND_URL}/website`,{
            url:"https://google.com",
        },{
                headers:{
                    authorization:token
                }
            });
        expect(response.data.id).not.toBeNull();
        }
        catch(e){

        }
    })
    it("website is not created if the header isnot present",async()=>{
        try {
            await axios.post(`${BACKEND_URL}/website`, {
                url: "https://google.com",
            });
            expect(false, "Website created when it shouldnt without auth header");
        } catch (e) {

        }
    })
})
describe("Can fetch website", () => {
    let token1: string, userId1: string;
    let token2: string, userId2: string;

    beforeAll(async () => {
        const user1 = await createUser();
        const user2 = await createUser();
        token1 = user1.jwt;
        userId1 = user1.id;
        token2 = user2.jwt;
        userId2 = user2.id;
    });

    it("Is able to fetch a website that the user created", async () => {
        const websiteResponse = await axios.post(`${BACKEND_URL}/website`, {
            url: "https://hdjjhdhdjhdj.com/"
        }, {
            headers: {
                Authorization: token1
            }
        })

        const getWebsiteResponse = await axios.get(`${BACKEND_URL}/status/${websiteResponse.data.id}`, {
            headers: {
                Authorization: token1
            }
        })

        console.log(getWebsiteResponse.data)
        
        expect(getWebsiteResponse.data.id).toBe(websiteResponse.data.id)
        expect(getWebsiteResponse.data.user_id).toBe(userId1)
    })

    it("Cant access website created by other user", async () => {
        const websiteResponse = await axios.post(`${BACKEND_URL}/website`, {
            url: "https://hdjjhdhdjhdj.com/"
        }, {
            headers: {
                Authorization: token1
            }
        })

        try {

            await axios.get(`${BACKEND_URL}/status/${websiteResponse.data.id}`, {
                headers: {
                    Authorization: token2
                }
            })
            expect(false, "Should NOT be able to access website of a different user")
        } catch(e) {

        }
    })
})