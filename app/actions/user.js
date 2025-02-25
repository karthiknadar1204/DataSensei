import { db } from "@/configs/db";
import { users } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function StoreUser(userId, firstName, email) {

    const existingUser = await db.select().from(users).where(eq(users.clerk_id, userId));
    
    if (existingUser.length > 0) {
        console.log("User already exists");
        return existingUser[0];
    }


    const user = await db.insert(users).values({
        clerk_id: userId,
        name: firstName,
        email: email
    });
    console.log("User stored successfully:", user);
    return user;
}