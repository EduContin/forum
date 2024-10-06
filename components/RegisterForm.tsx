// components/RegisterForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  Alert,
  Button,
  Snackbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import PasswordStrengthBar from "react-password-strength-bar";
import Link from "next/link";
import {
  ArrowForward,
  CheckCircle,
  Security,
  Speed,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const FIXED_FLOAT_AFFILIATE_LINK = "https://ff.io/BTC/XMR/?ref=cpnqy9ga";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showExchangeInfo, setShowExchangeInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

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

  const createPayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pay_currency: "USD",
          price_amount: 0.5,
          username,
          email,
          password,
          referralCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.payment_url;
      } else {
        throw new Error("Failed to create payment");
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      setError("Failed to create payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await createPayment();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Registration</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
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
            className="w-full px-3 py-2 mb-4 border rounded bg-slate-800 border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-white"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded bg-slate-800 border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-white"
            required
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border rounded bg-slate-800 border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-white"
              required
            />
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              style={{ color: "white" }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <PasswordStrengthBar password={password} />
          <div className="flex items-center mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                />
                <div
                  className={`w-6 h-6 bg-slate-700 rounded-md border ${agreedToTerms ? "border-blue-500" : "border-slate-500"} transition-all duration-200 ease-in-out`}
                >
                  <svg
                    className={`w-6 h-6 text-blue-500 pointer-events-none ${agreedToTerms ? "opacity-100" : "opacity-0"} transition-opacity duration-200 ease-in-out`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
              <span className="ml-2 text-sm text-slate-300">
                I agree to the terms and conditions
              </span>
            </label>
          </div>
          <Typography variant="body2" className="mb-4 text-slate-300">
            For privacy reasons, we only accept payments in Monero (XMR).
          </Typography>
          <Button
            onClick={() => setShowExchangeInfo(true)}
            variant="outlined"
            color="primary"
            fullWidth
            className="mb-4"
            startIcon={<ArrowForward />}
          >
            How to get Monero (XMR)
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Register and Pay 8 XMR"}
          </Button>
        </form>
        <p className="mt-4 text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </main>

      <Dialog
        open={showExchangeInfo}
        onClose={() => setShowExchangeInfo(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#1f2937",
            color: "#e5e7eb",
          },
        }}
      >
        <DialogTitle className="text-2xl font-bold text-white">
          How to Get Monero (XMR) using FixedFloat
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="mb-4 text-white">
            Use a fast and reliable cryptocurrency exchange platform to exchange
            your current cryptos to XMR:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className="text-white">
                    1. Visit our recommended exchange platform (you can create
                    an account)
                  </span>
                }
                secondary={
                  <MuiLink
                    href={FIXED_FLOAT_AFFILIATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400"
                  >
                    Click here to go to FixedFloat
                  </MuiLink>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className="text-white">2. Select Exchange Pair</span>
                }
                secondary={
                  <span className="text-slate-300">
                    Choose the cryptocurrency you want to exchange (e.g., BTC,
                    ETH) as the &apos;You Send&apos; currency, and select XMR as
                    the &apos;You Get&apos; currency.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-white">3. Enter Amount</span>}
                secondary={
                  <span className="text-slate-300">
                    Specify the amount you want to exchange. Make sure it&apos;s
                    enough to cover the 8 XMR registration fee plus any
                    transaction fees.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className="text-white">
                    4. Provide XMR Receiving Address
                  </span>
                }
                secondary={
                  <span className="text-slate-300">
                    Enter your XMR wallet address where you want to receive the
                    exchanged Monero.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className="text-white">5. Complete the Exchange</span>
                }
                secondary={
                  <span className="text-slate-300">
                    Follow the instructions to send your cryptocurrency to the
                    provided FixedFloat address. The exchange will process
                    automatically.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForward className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-white">6. Receive XMR</span>}
                secondary={
                  <span className="text-slate-300">
                    Once the exchange is complete, you&apos;ll receive the XMR
                    in your specified wallet address.
                  </span>
                }
              />
            </ListItem>
          </List>
          <Typography
            variant="h6"
            gutterBottom
            className="mt-4 text-xl font-semibold text-white"
          >
            Why Use Monero (XMR)?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Security className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-white">Enhanced Privacy</span>}
                secondary={
                  <span className="text-slate-300">
                    Monero uses advanced cryptography to ensure that all
                    transactions are private and untraceable.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-white">Fungibility</span>}
                secondary={
                  <span className="text-slate-300">
                    All XMR coins are interchangeable, ensuring that your
                    transactions cannot be blacklisted or traced.
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Speed className="text-blue-500" />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-white">Low Fees</span>}
                secondary={
                  <span className="text-slate-300">
                    Monero transactions typically have lower fees compared to
                    many other cryptocurrencies.
                  </span>
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowExchangeInfo(false)}
            className="text-slate-300"
          >
            Close
          </Button>
          <Button
            onClick={() => window.open(FIXED_FLOAT_AFFILIATE_LINK, "_blank")}
            variant="contained"
            color="primary"
          >
            Go to Exchange
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        message="Registration successful"
      />
    </div>
  );
}
