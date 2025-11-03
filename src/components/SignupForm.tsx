"use client"

import { useSignUp } from '@clerk/nextjs'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { signUpSchema } from '../../schemas/signUpSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useRouter } from 'next/navigation'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Separator } from './ui/separator'

import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from './ui/input'
import { Button } from './ui/button'
import Link from 'next/link'


export default function SignupForm() {

  const router = useRouter()
  const { signUp, isLoaded, setActive } = useSignUp() //destructured clerk hook
  const [ isSubmitting, setIsSubmitting ] = useState( false ) //when submitting form
  const [ authError, setAuthError ] = useState<String | null>( null ) // error in auth
  const [verifying, setVerifying] = useState(false) //clerk will initiate the verification process and will render HTML elements it is set to false bcz we are not verifying at this moment
  const [verificationCode, setVerificationCode] = useState("") //code
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  //React hook form

    const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver : zodResolver(signUpSchema), //we have to tell what resolver we are using and what schema(zod) we are using, zod can have multiple schema
    defaultValues : {
      email : "",
      password : "",
      passwordConfirmation : ""  //Default values our schema will have
    } 
  })

  const onSubmit = async ( data : z.infer<typeof signUpSchema> ) => {
    if( !isLoaded )
    {
      return
    }
    setIsSubmitting( true ) // so the spinner can kick in
    setAuthError(null) //reset all errors

    //we have to send some values to clerk
    try {
      await signUp.create({              //functions given by clerk
        emailAddress : data.email,
        password : data.password
      })
      await signUp.prepareEmailAddressVerification({
        strategy : "email_code"
      })
    } catch (error : any) {
      console.error("Sign-up error", error)
      setAuthError(
        //destructure the error the very first message we get is err
        error.errors?.[0].message  || "An error occurred during the signup. Please try again "
      )
    }finally{
      setIsSubmitting( false )
    }
  }

  // Here we will receive the code
  const handleVerificationSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if( !isLoaded || !signUp ){
      return
    }
     setIsSubmitting( true ) // so the spinner can kick in
    setAuthError(null) //reset all errors

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code : verificationCode
      })
      //todo : console result
      if( result.status == "complete" ){
        await setActive({ session : result.createdSessionId })
        router.push("/dashboard")
      }else{
        console.error("Verification incomplete", result)
        setVerificationError("Verification could not be completed")
      }

    } catch (error : any) {
      console.error("Verification incomplete", error)
      setVerificationError(
        error.errors?.[0].message  || "An error occurred during the signup. Please try again "
      )
    }finally{
      setIsSubmitting( false )
    }
  }

// if verifying it will load a component

 if (verifying) {
    return (
      <Card className="w-full max-w-md border bg-muted/40 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 space-y-6">
          {verificationError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive p-3 text-sm">
              <AlertCircle className="h-5 w-5" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-foreground"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Didn't receive a code?{" "}
            <button
              onClick={async () => {
                if (signUp) {
                  await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                  });
                }
              }}
              className="text-primary hover:underline font-medium"
            >
              Resend code
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border bg-muted/40 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">
          Create Your Account
        </CardTitle>
        <CardDescription>
          Sign up to start managing your images securely
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 space-y-6">
        {/* if auth error true it will load the component */}
        {authError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive p-3 text-sm">
            <AlertCircle className="h-5 w-5" />
            <p>{authError}</p>
          </div>
        )}

        {/* on submit will not directly submit the data...it expects the data we configured in onSubmit zod function */}
        {/* so we have to use handleSubmit */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="pl-10"
                {...register("email")} //obj destructuring of register and now its impacting on email
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")} //obj destructuring of register and now its impacting on password
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="passwordConfirmation" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("passwordConfirmation")} //obj destructuring of register and now its impacting on confirm pass
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {errors.passwordConfirmation && (
                <p className="text-sm text-destructive mt-1">
                  {errors.passwordConfirmation.message}
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              By signing up, you agree to our{" "}
              <span className="text-primary underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center py-4 text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}