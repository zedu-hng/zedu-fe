"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "~/components/ui/checkbox";
import Loading from "~/components/ui/loading";
import { PostRequest } from "~/utils/request";
import { useGoogleLogin } from "@react-oauth/google";
import { RegisterWebhookRequest } from "~/utils/webhook-request";
import AppleSignin from "react-apple-signin-auth";
import { Eye, EyeOff } from "lucide-react";
import AuthSideBanner from "~/app/(auth)/_components/auth-side-banner";

// The backend auto-creates a workspace at signup, so `is_onboarded` being
// true does not mean the user ever chose one. A missing type is never default.
const isAutoCreatedOrg = (type?: string) =>
  (type ?? "").trim().toLowerCase() === "user default org";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMinLength, setIsMinLength] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleloading, setGoogleloading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

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
          if (
            user?.is_onboarded &&
            !isAutoCreatedOrg(user?.organisation?.type)
          ) {
            router.push(`/${orgSlug}`);
          } else {
            router.push(`/${orgSlug}/welcome`);
          }
        }
        const message = `\nName: ${user?.username}\nEmail: ${user?.email}`;
        RegisterWebhookRequest(
          user?.username,
          "User Registration (Apple)",
          message.trim(),
          "success"
        );
      }
    } catch (err) {
      console.error("Apple Signup Error:", err);
    } finally {
      setAppleLoading(false);
    }
  };

  useEffect(() => {
    const fromInvite = new URLSearchParams(window.location.search).get(
      "invite"
    );

    if (fromInvite) {
      const fullUrl = window.location.href;
      localStorage.setItem("postInviteRedirect", fullUrl);
    }
  }, []);

  useEffect(() => {
    const inviteEmail = searchParams.get("email");
    if (inviteEmail) {
      setEmail(inviteEmail.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    const minLength = password.length >= 6;
    setIsMinLength(minLength);
    setIsValidPassword(minLength);
    setFormSubmitted(false);
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = () => {
    setPasswordFocused(true);
  };

  const handleBlur = () => {
    setPasswordFocused(false);
  };

  // validate form
  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      newErrors.email = "Invalid email address";
    }

    if (!password || password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (!isValidPassword) {
      newErrors.password = "Password is not valid";
    } else if (!isMinLength) {
      newErrors.password = "Password must have a minimum of 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  // email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
  };

  const handleEmailBlur = () => {
    setEmail((current) => current.trim());
  };

  // password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) {
      setEmail(trimmedEmail);
    }

    if (validateForm() && isValidPassword) {
      setLoading(true);
      const payload = {
        email: trimmedEmail,
        password,
      };

      const redirectUrl = searchParams.get("redirect") || "";
      const res = await PostRequest("/auth/register", payload);

      if (res?.status === 200 || res?.status === 201) {
        localStorage.setItem("token", res?.data?.data?.access_token);
        localStorage.setItem("useremail", res?.data?.data?.user?.email);
        localStorage.setItem("user", JSON.stringify(res?.data?.data?.user));
        localStorage.setItem("orgId", res?.data?.data?.user?.current_org);
        const orgSlug = res.data.data.user.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }

        if (redirectUrl) {
          setTimeout(() => {
            router.push(redirectUrl);
          }, 100);
        } else {
          setTimeout(() => {
            if (
              res?.data?.data?.user?.is_onboarded &&
              !isAutoCreatedOrg(res?.data?.data?.user?.organisation?.type)
            ) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }, 100);
        }

        const user = res?.data?.data?.user;

        const message = `
          Name: ${user?.username}\n
          Email: ${user?.email}
          `;

        RegisterWebhookRequest(
          user?.username,
          "User Registration",
          message.trim(),
          "success"
        );
      } else {
        setLoading(false);
      }
    }
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
            if (
              user?.is_onboarded &&
              !isAutoCreatedOrg(user?.organisation?.type)
            ) {
              router.push(`/${orgSlug}`);
            } else {
              router.push(`/${orgSlug}/welcome`);
            }
          }

          const message = `
          Name: ${user?.username}\n
          Email: ${user?.email}
          `;

          RegisterWebhookRequest(
            user?.username,
            "User Registration",
            message.trim(),
            "success"
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
    <main className="w-full min-h-screen flex flex-col lg:flex-row bg-white">
      <AuthSideBanner />

      <section className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen px-6 sm:px-10 lg:px-16 py-8 overflow-y-auto">
        {/* Top navigation row */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link href="/" className="flex items-center">
            <Image src="/Zedu.png" alt="Zedu" width={86} height={31} priority />
          </Link>
          <div className="text-sm text-[#344054]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#7141F8] font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Centered form container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#101828] tracking-tight">
              Create an account
            </h1>
            <p className="text-sm md:text-base text-[#475467]">
              Start collaborating with your team today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
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
                type="email"
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
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#344054]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`w-full text-sm text-[#101828] placeholder-[#98A2B3] h-11 px-3.5 pr-10 border ${
                    formSubmitted
                      ? errors.password
                        ? "border-[#FDA29B] focus:border-[#F04438]"
                        : "border-[#D0D5DD] focus:border-[#7141F8]"
                      : passwordFocused
                        ? "border-[#D0D5DD] focus:border-[#7141F8]"
                        : "border-[#D0D5DD] focus:border-[#7141F8]"
                  } outline-none rounded-lg shadow-sm transition-colors`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  <span className="animate-pulse">Creating account...</span>
                  <Loading width="18" height="18" />
                </span>
              ) : (
                "Create account"
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
                aria-label="Sign up with Google"
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
                      ? window.location.origin + "/auth/sign-up"
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
                    aria-label="Sign up with Apple"
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
                  console.error("Apple Signup Error:", err);
                }}
              />
            </div>

            {/* Terms & Privacy */}
            <p className="text-xs text-[#475467] text-center mt-2 leading-relaxed">
              By signing up, you agree to our{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                className="font-medium text-[#7141F8] hover:underline"
              >
                terms of service
              </Link>{" "}
              and{" "}
              <Link
                href="/policy"
                target="_blank"
                className="font-medium text-[#7141F8] hover:underline"
              >
                privacy policy
              </Link>
              .
            </p>
          </form>
        </div>

        <div className="hidden lg:block h-6" />
      </section>
    </main>
  );
}

export default SignUp;
