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
import { Eye, EyeOff, Mail } from "lucide-react";
import AuthSideBanner from "~/app/(auth)/_components/auth-side-banner";

//

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const message = `\nName: ${user?.username}\nEmail: ${user?.email}`;
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

  const handleEmailBlur = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await PostRequest("/auth/login", {
        email: email.trim(),
        password,
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

        const message = `\nName: ${user?.username}\nEmail: ${user?.email}`;
        await LoginWebhookRequest(
          user?.username,
          "User Login Detected",
          message.trim(),
          "success",
          user?.avatar_url
        );
      } else {
        const errorMessage =
          res?.data?.message || "Login failed. Please try again.";
        setErrors((prev) => ({
          ...prev,
          password: errorMessage,
        }));
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred.";
      setErrors((prev) => ({
        ...prev,
        password: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleloading(true);
      try {
        const res = await PostRequest("/auth/google", {
          token: tokenResponse.access_token,
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

          const message = `\nName: ${user?.username}\nEmail: ${user?.email}`;
          await LoginWebhookRequest(
            user?.username,
            "User Login Detected (Google)",
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

  return (
    <>
      <Toaster />
      <main className="w-full min-h-screen flex flex-col lg:flex-row bg-white">
        <AuthSideBanner />

        <section className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen px-6 sm:px-10 lg:px-16 py-8 overflow-y-auto">
          {/* Top navigation row */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            <Link href="/" className="flex items-center">
              <Image
                src="/Zedu.png"
                alt="Zedu"
                width={86}
                height={31}
                priority
              />
            </Link>
            <div className="text-sm text-[#344054]">
              New to Zedu?{" "}
              <Link
                href="/auth/sign-up"
                className="text-[#7141F8] font-medium hover:underline"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Centered form container */}
          <div className="w-full max-w-md mx-auto my-auto py-8">
            <div className="flex flex-col items-center text-center gap-2 mb-8">
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#101828] tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm md:text-base text-[#475467]">
                Log in to catch up with your team.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-5"
            >
              {/* Email address */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#344054]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full text-sm text-[#101828] placeholder-[#98A2B3] h-11 px-3.5 border ${
                    errors.email
                      ? "border-[#FDA29B] focus:border-[#F04438]"
                      : "border-[#D0D5DD] focus:border-[#7141F8]"
                  } outline-none rounded-lg shadow-sm transition-colors`}
                />
                {errors.email && (
                  <span id="email-error" className="text-xs text-[#F04438]">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#344054]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-[#7141F8] hover:underline"
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
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`w-full text-sm text-[#101828] placeholder-[#98A2B3] h-11 px-3.5 pr-10 border ${
                      errors.password
                        ? "border-[#FDA29B] focus:border-[#F04438]"
                        : "border-[#D0D5DD] focus:border-[#7141F8]"
                    } outline-none rounded-lg shadow-sm transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085] focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span id="password-error" className="text-xs text-[#F04438]">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Keep me logged in */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  className="rounded border-[#D0D5DD] data-[state=checked]:bg-[#7141F8] data-[state=checked]:border-[#7141F8]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[#475467] font-normal cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#7141F8] hover:bg-[#5f33d6] text-white font-medium text-sm rounded-lg shadow-sm transition-colors mt-1"
                disabled={loading || googleloading || appleLoading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">Logging in...</span>
                    <Loading width="18" height="18" />
                  </span>
                ) : (
                  "Log in"
                )}
              </Button>

              {/* Divider: or */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-[#EAECF0]" />
                <span className="absolute bg-white px-3 text-xs text-[#667085] lowercase">
                  or
                </span>
              </div>

              {/* Social Login 2-columns */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => login()}
                  disabled={googleloading || appleLoading}
                  aria-label="Sign in with Google"
                  aria-busy={googleloading}
                  className="flex items-center justify-center gap-2 h-11 px-4 border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
                >
                  <Image
                    src="/dashboard/google.svg"
                    width={18}
                    height={18}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>
                    {googleloading ? (
                      <span className="flex items-center gap-1.5">
                        <Loading width="14" height="14" color="#7141F8" />
                      </span>
                    ) : (
                      "Google"
                    )}
                  </span>
                </button>

                <AppleSignin
                  authOptions={{
                    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
                    scope: "email name",
                    redirectURI:
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "",
                    usePopup: true,
                  }}
                  uiType="dark"
                  noDefaultStyle={true}
                  render={(props: any) => (
                    <button
                      type="button"
                      onClick={props.onClick}
                      disabled={appleLoading || googleloading}
                      aria-label="Sign in with Apple"
                      aria-busy={appleLoading}
                      className="flex items-center justify-center gap-2 h-11 px-4 border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors w-full cursor-pointer"
                    >
                      <Image
                        src="/dashboard/apple.png"
                        width={18}
                        height={18}
                        alt=""
                        aria-hidden="true"
                      />
                      <span>
                        {appleLoading ? (
                          <span className="flex items-center gap-1.5">
                            <Loading width="14" height="14" color="#000" />
                          </span>
                        ) : (
                          "Apple"
                        )}
                      </span>
                    </button>
                  )}
                  onSuccess={handleAppleSuccess}
                  onError={(err: any) => {
                    setAppleLoading(false);
                    console.error("Apple Login Error:", err);
                  }}
                />
              </div>

              {/* Magic link button */}
              <Link href="/auth/magiclink" className="w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 h-11 px-4 border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
                >
                  <Mail size={16} className="text-[#667085]" />
                  <span>Email me a login link</span>
                </button>
              </Link>
            </form>
          </div>

          <div className="hidden lg:block h-6" />
        </section>
      </main>
    </>
  );
}

export default Login;
