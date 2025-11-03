import * as z from 'zod'

export const signInSchema = z

.object({ 
    identifier : z
               .email("Please enter a valid e-mail address") // we don't need .string() here now!!
               .min(1, { message: "e-mail or username is required" }),
    password : z
             .string()
             .min(1,{message:"Password is Required"})
             .min(8,{message:"Password must be at-least 8 characters"}),
})