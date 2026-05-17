import {describe, it,expect, beforeAll} from "bun:test";
import axios from "axios"
import { createUser } from "./testUtils";
let BASE_URL="http://localhost:3000";



describe("Website gets created", () => {
    let jwt:string,token:string; 
    beforeAll(async () => {
        const data=await createUser();
        jwt=data.jwt,
        token=data.jwt
    });
    it("Website not created if url is not present", async () => {
        try {
            await axios.post(`${BASE_URL}/website`, {
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
        try{const response=await axios.post(`${BASE_URL}/website`,{
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
            await axios.post(`${BASE_URL}/website`, {
                url: "https://google.com",
            });
            expect(false, "Website created when it shouldnt without auth header");
        } catch (e) {

        }
    })
})
