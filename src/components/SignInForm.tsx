"use client"

import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { signInSchema } from '../../schemas/signInSchema'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Link from 'next/link'


const router = useRouter()
const{ signIn, isLoaded, setActive } = useSignIn()
 const [isSubmitting, setIsSubmitting] = useState( false );
  const [authError, setAuthError] = useState<string | null>( null );
const [showPassword, setShowPassword] = useState(false);

 //React hook form

    const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver : zodResolver(signInSchema), //we have to tell what resolver we are using and what schema(zod) we are using, zod can have multiple schema
    defaultValues : {
      identifier : "",
      password : "",
    //Default values our schema will have
    } 
  })

  const onSubmit = async( data : z.infer<typeof signInSchema> ) => {
    if( !isLoaded ){
        return
    }
    setIsSubmitting( true )
    setAuthError( null )


    try {
        const result = await signIn.create({
            identifier : data.identifier,
            password : data.password
        })

        if( result.status === "complete" )
        {
           await setActive({ session : result.createdSessionId })
           router.push("/dashboard")
        }else{
            setAuthError("Sign in error")
        }


    } catch (error : any) 
    {
        setAuthError(
            error.errors?.[0]?.message  || "An error occurred during the signin process. Please try again "
        )
    }finally{
        setIsSubmitting(false)
    }
  }

export default function signInForm() {
   return (
    <Card className="w-full max-w-md border bg-muted/40 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your secure cloud storage
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 space-y-6">
        {authError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 text-destructive p-3 text-sm">
            <AlertCircle className="h-5 w-5" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="identifier"
                type="email"
                placeholder="your.email@example.com"
                className="pl-10"
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive mt-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center py-4 text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
