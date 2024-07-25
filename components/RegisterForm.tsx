"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import PasswordStrengthBar from "react-password-strength-bar";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return false;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Invalid email format");
      return false;
    }
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Register</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            autoFocus
            className="w-full px-3 py-2 mb-4 border rounded"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 mb-4 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 mb-4 border rounded"
          />
          <PasswordStrengthBar password={password} className="mb-4" />
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                sx={{
                  color: "white",
                  "& .MuiSvgIcon-root": {
                    fontSize: 28,
                  },
                }}
              />
            }
            label="I agree to the terms and conditions"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="w-full mt-4"
          >
            Register
          </Button>
          <Snackbar
            open={showSuccessMessage}
            autoHideDuration={3000}
            onClose={() => setShowSuccessMessage(false)}
            message="Registration successful"
          />
        </form>
      </main>
    </div>
  );
}
