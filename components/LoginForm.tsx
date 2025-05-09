"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Snackbar, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const DynamicMountainBackground = dynamic(
  () => import("./MountainBackground"),
  {
    ssr: false,
  },
);

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  // eslint-disable-next-line no-unused-vars
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/";
    }
  }, [status, router]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const { username, password } = formData;

      if (!username.trim() || !password.trim()) {
        setError("Username and password are required");
        setIsLoading(false);
        return;
      }

      try {
        const result = await signIn("credentials", {
          username: username.trim(),
          password: password.trim(),
          redirect: false,
        });

        if (result?.error) {
          setError("Login failed");
        } else {
          setIsSuccess(true);
          // The useEffect hook will handle redirection
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <DynamicMountainBackground isLoading={isLoading} isSuccess={isSuccess} />
      <div className="relative z-10">
        <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
          <h1 className="text-4xl font-bold mb-8">Login</h1>
          <form onSubmit={handleSubmit} className="w-full max-w-xs">
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 border rounded"
              autoFocus
            />
            <div className="relative mb-4">
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
                <IconButton
                  onClick={togglePasswordVisibility}
                  className="ml-2"
                  style={{ color: "inherit" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-500">
              Register
            </Link>
          </p>
        </main>
      </div>
      <Snackbar
        open={isSuccess}
        autoHideDuration={3000}
        onClose={() => setIsSuccess(false)}
        message="Login successful"
      />
    </div>
  );
}
