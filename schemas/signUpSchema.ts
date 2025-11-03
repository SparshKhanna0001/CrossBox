import * as z from 'zod'

export const signUpSchema = z

.object({ 
    email : z
          .email("please enter a valid e-mail address") // we don't need .string() here now!!
          .min(1, { message: "Email is required" }),
    password : z
             .string()
             .min(1,{message:"Password is Required"})
             .min(8,{message:"Password must be at-least 8 characters"}),
    passwordConfirmation : z
                         .string()
                         .min(1,{message:"Please confirm your password"})
             
})

  //what .refine means => This data must also satisfy this condition.
  //If the condition returns false, Zod throws a validation error with your custom message.
.refine((data) => data.password === data.passwordConfirmation,{
    message: "Passwords does not match",
    path: ["passwordConfirmation"]
})