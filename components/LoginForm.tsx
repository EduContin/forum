"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Snackbar } from "@mui/material";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
        setShowSuccessMessage(true);
        router.push("/dashboard");
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded"
          />
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
      </main>
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        message="Login successful"
      />
    </div>
  );
}
