"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function PremiumAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message!);
      } else {
        if ((data as any)?.twoFactorRedirect) {
          setShowOtp(true);
          toast.success("Please enter the verification code sent to you.");
        } else {
          toast.success("Welcome back!");
          setTimeout(() => router.push("/"), 1500);
        }
      }
    } catch (err: any) {
      toast.error("Stateless backend not fully configured yet. Add your db via FastAPI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        toast.error(error.message!);
      } else {
        toast.success("Account created successfully!");
        setTimeout(() => router.push("/"), 1500);
      }
    } catch (err: any) {
      toast.error("Stateless backend not fully configured yet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: otpCode,
      });
      if (res.error) {
         toast.error(res.error.message || "Invalid OTP");
      } else {
         toast.success("Verification complete");
         setTimeout(() => router.push("/"), 1500);
      }
    } catch (err: any) {
      toast.error("Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple") => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: provider,
      });
      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
      }
    } catch (err: any) {
      toast.error(`Error connecting to ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 text-white selection:bg-white">
      <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-black  blur-[120px]" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-black blur-[120px]" />

      <div className="z-10 w-full max-w-md p-6">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
          </p>
        </div>

        {showOtp ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-zinc-400">
                Enter the verification code to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-zinc-300">OTP Code</Label>
                  <Input
                    id="otp"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-zinc-200">
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
               <Button variant="link" onClick={() => setShowOtp(false)} className="px-0 text-sm text-zinc-400 hover:text-white">
                 Back to login
               </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-lg bg-white/5 p-1 backdrop-blur-md">
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-xl text-zinc-400 transition-all">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-xl text-zinc-400 transition-all">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <Card className="border-zinc-800 bg-black/40 backdrop-blur-xl shadow-2xl">

                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login" className="text-zinc-300">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-login" className="text-zinc-300">Password</Label>
                        <a href="#" className="text-xs text-white hover:text-amber-100 transition-colors">Forgot password?</a>
                      </div>
                      <Input
                        id="password-login"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-zinc-200 transition-colors">
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-6 w-full">
                  <div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                    <span className="relative z-10 px-2 text-zinc-500 bg-zinc-950/40 backdrop-blur-md">
                      Or continue with
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" type="button" onClick={() => handleSocialLogin("google")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                       <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>Google</title><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => handleSocialLogin("github")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>GitHub</title><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                      GitHub
                    </Button>
                    {/* <Button variant="outline" type="button" onClick={() => handleSocialLogin("apple")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>Apple</title><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" /></svg>
                      Apple
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <Card className="border-zinc-800 bg-black/40 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Create an account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-signup" className="text-zinc-300">Full Name</Label>
                      <Input
                        id="name-signup"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-zinc-300">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-zinc-300">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-white"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r bg-white text-black hover:bg-zinc-200 transition-colors">
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-6 w-full">
                  <div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
                    <span className="relative z-10 px-2 text-zinc-500 bg-zinc-950/40 backdrop-blur-md">
                      Or continue with
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" type="button" onClick={() => handleSocialLogin("google")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>Google</title><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => handleSocialLogin("github")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                       <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>GitHub</title><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                      GitHub
                    </Button>
                    {/* <Button variant="outline" type="button" onClick={() => handleSocialLogin("apple")} disabled={isLoading} className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><title>Apple</title><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" /></svg>
                      Apple
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
