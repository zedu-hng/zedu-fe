"use client";

import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "~/components/ui/toaster";
import { PostRequest } from "~/utils/request";
import Loading from "~/components/ui/loading";
import { LoginWebhookRequest } from "~/utils/webhook-request";
import { useGoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import { Separator } from "~/components/ui/separator";
import { Eye, EyeOff, Mail } from "lucide-react";
import { AuthHeroBanner } from "~/app/(auth)/_components/auth-hero-banner";
import { showError } from "~/components/toast/sonner";

//

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleloading, setGoogleloading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    const inviteEmail = searchParams.get("email");
    if (inviteEmail) {
      setEmail(inviteEmail.trim());
    }
  }, [searchParams]);

  // Apple Login handler
  const handleAppleSuccess = async (response: any) => {
    setAppleLoading(true);
    try {
      const id_token = response?.authorization?.id_token;
      if (!id_token) throw new Error("No id_token from Apple");
      const res = await PostRequest("/auth/apple", { id_token });
      if (res?.status === 200 || res?.status === 201) {
        const user = res?.data?.data?.user;
        const redirectUrl = searchParams.get("redirect") || "";
        localStorage.setItem("token", res?.data?.data?.access_token);
        localStorage.setItem("useremail", user?.email);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("orgId", user?.current_org);
        const orgSlug = res.data.data.user.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          if (user?.is_onboarded) {
            router.push(`/${orgSlug}`);
          } else {
            router.push(`/${orgSlug}/welcome`);
          }
        }
        const message = `\nName: ${user?.username}\\nEmail: ${user?.email}`;
        await LoginWebhookRequest(
          user?.username,
          "User Login Detected (Apple)",
          message.trim(),
          "success",
          user?.avatar_url
        );
      }
    } catch (err) {
      console.error("Apple Login Error:", err);
    } finally {
      setAppleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (validateForm()) {
      setLoading(true);

      const payload = {
        email: trimmedEmail,
        password,
      };

      const redirectUrl = searchParams.get("redirect") || "";
      const coworkerId = searchParams.get("coworkerId") || "";

      const res = await PostRequest("/auth/login", payload);

      if (res?.status === 200 || res?.status === 201) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", res?.data?.data?.access_token);
        storage.setItem("useremail", res?.data?.data?.user?.email);
        storage.setItem("user", JSON.stringify(res?.data?.data?.user));
        storage.setItem("orgId", res?.data?.data?.user?.current_org);
        if (!rememberMe) {
          localStorage.setItem("token", res?.data?.data?.access_token);
        }

        const orgSlug = res.data.data.user.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }

        if (redirectUrl) {
          // If there's a coworkerId, append it to the redirect URL
          const finalRedirectUrl = coworkerId
            ? `${redirectUrl}?coworkerId=${coworkerId}`
            : redirectUrl;
          setTimeout(() => {
            router.push(finalRedirectUrl);
          }, 100);
        } else {
          setTimeout(() => {
            if (res?.data?.data?.user?.is_onboarded) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }, 100);
        }

        const user = res?.data?.data?.user;
        // after successful login call this endpoint
        const message = `
            Name: ${user?.username}\\n
            Email: ${user?.email}
            `;

        await LoginWebhookRequest(
          user?.username,
          "User Login Detected",
          message.trim(),
          "success",
          user?.avatar_url
        );
      } else {
        setLoading(false);
        if (!res?.response?.data?.message) {
          showError(res?.message || "Invalid email or password");
        }
        LoginWebhookRequest(
          trimmedEmail,
          "New User Login",
          "Error authenticating user",
          "error"
        );
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
  };

  const handleEmailBlur = () => {
    setEmail((current) => current.trim());
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
  };

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      setGoogleloading(true);

      const { code } = tokenResponse;

      try {
        const res = await PostRequest("/auth/google", {
          grant_code: code,
        });

        if (res?.status === 200 || res?.status === 201) {
          const user = res?.data?.data?.user;
          const redirectUrl = searchParams.get("redirect") || "";

          localStorage.setItem("token", res?.data?.data?.access_token);
          localStorage.setItem("useremail", user?.email);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("orgId", user?.current_org);
          const orgSlug = res.data.data.user.current_organisation_slug;
          if (orgSlug) {
            localStorage.setItem("orgSlug", orgSlug);
          }

          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            if (user?.is_onboarded) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }

          const message = `
            Name: ${user?.username}\\n
            Email: ${user?.email}
            `;

          await LoginWebhookRequest(
            user?.username,
            "User Login Detected",
            message.trim(),
            "success",
            user?.avatar_url
          );
        }
      } catch (err) {
        console.error("Google Login Error:", err);
      } finally {
        setGoogleloading(false);
      }
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  //

  return (
    <div className="h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-white overflow-hidden">
      <AuthHeroBanner
        title={
          <>
            Your team has
            <br />
            been busy.
          </>
        }
        subtitle="12 new messages are waiting for you in 3 channels."
      />
      <main className="w-full h-full flex flex-col justify-between px-6 py-4 sm:px-10 sm:py-6 lg:px-10 lg:py-6 xl:px-16 xl:py-8 overflow-y-auto">
        <header className="w-full flex items-center justify-between pb-1 sm:pb-2 shrink-0">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950 font-sans"
          >
            Zedu
          </Link>
          <div className="text-xs sm:text-sm text-gray-500">
            New to Zedu?{" "}
            <Link
              href="/auth/sign-up"
              className="text-[#635BFF] hover:underline font-medium"
            >
              Create an account
            </Link>
          </div>
        </header>

        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-1 sm:py-2">
          <div className="mb-3 sm:mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Log in to catch up with your team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
                className={`w-full h-10 px-3 text-sm rounded-lg border ${errors.email ? "border-red-500" : "border-gray-200 focus:border-[#635BFF]"} outline-none focus:ring-2 focus:ring-[#635BFF]/15 transition-colors text-gray-900 placeholder:text-gray-400`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#635BFF] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className={`w-full h-10 pl-3 pr-10 text-sm rounded-lg border ${errors.password ? "border-red-500" : "border-gray-200 focus:border-[#635BFF]"} outline-none focus:ring-2 focus:ring-[#635BFF]/15 transition-colors text-gray-900 placeholder:text-gray-400`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-0.5 pb-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="data-[state=checked]:bg-[#635BFF] data-[state=checked]:border-[#635BFF]"
              />
              <label
                htmlFor="remember"
                className="text-xs sm:text-sm text-gray-600 select-none cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || googleloading || appleLoading}
              className="w-full h-10 bg-[#635BFF] hover:bg-[#5248e3] text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">Logging in...</span>
                  <Loading width="18" height="18" color="#ffffff" />
                </span>
              ) : (
                "Log in"
              )}
            </Button>

            <div className="relative my-3 sm:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2.5 text-gray-400">or</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => login()}
                disabled={googleloading || loading}
                className="w-full h-10 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
              >
                <Image
                  src="/dashboard/google.svg"
                  width={16}
                  height={16}
                  alt="Google"
                  className="w-4 h-4 shrink-0"
                />
                <span>{googleloading ? "Signing in..." : "Google"}</span>
              </button>

              <AppleSignin
                authOptions={{
                  clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
                  scope: "email name",
                  redirectURI:
                    typeof window !== "undefined" ? window.location.origin : "",
                  usePopup: true,
                }}
                uiType="dark"
                className="w-full"
                noDefaultStyle={true}
                render={(props: any) => (
                  <button
                    type="button"
                    onClick={props.onClick}
                    disabled={appleLoading || loading}
                    className="w-full h-10 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors disabled:opacity-60"
                  >
                    <Image
                      src="/dashboard/apple.png"
                      width={16}
                      height={16}
                      alt="Apple"
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                    <span>{appleLoading ? "Signing in..." : "Apple"}</span>
                  </button>
                )}
                onSuccess={handleAppleSuccess}
                onError={(err: any) => {
                  setAppleLoading(false);
                  console.error("Apple Login Error:", err);
                }}
              />
            </div>

            <Link
              href="/auth/magiclink"
              className="w-full h-10 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-gray-500" />
              <span>Email me a login link</span>
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;
