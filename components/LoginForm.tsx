"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Snackbar, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import Link from "next/link";
import MountainBackground from "./MountainBackground";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = (await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      })) as unknown as {
        ok: boolean;
        json: () => Promise<{ message: string }>;
      };

      if (response.ok) {
        setIsSuccess(true);
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <MountainBackground isLoading={isLoading} isSuccess={isSuccess} />
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
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded"
              autoFocus
            />
            <div className="relative mb-4">
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
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
            <Link href="/register" legacyBehavior>
              <a className="text-blue-500">Register</a>
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
