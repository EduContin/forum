// app/affiliate/page.tsx

"use client";

import { ContentCopy } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Snackbar,
} from "@mui/material";
import { redirect } from "next/navigation";

interface ReferralData {
  referredUsername: string;
  commission: number;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  balance: number;
}

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (session?.user?.name) {
      fetch(`/api/v1/users/${session.user.name}`)
        .then((response) => response.json())
        .then((user) => {
          setIsAdmin(user.user_group === "Admin");
          if (user.user_group === "Admin") {
            fetchUserBalances();
          }
        })
        .catch((error) => console.error("Error fetching user data:", error));

      fetchAffiliateData();
    }
  }, [session, status]);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch(`/api/v1/affiliate-data`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Affiliate data:", data);
      setReferrals(data.referrals);
      setBalance(parseFloat(data.balance) || 0);
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    }
  };

  const fetchUserBalances = async () => {
    try {
      console.log("Fetching user balances...");
      const response = await fetch("/api/v1/admin/user-balances", {
        credentials: "include",
      });
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched user balances:", data);
      setUsers(
        data.map((user: any) => ({
          ...user,
          balance: parseFloat(user.balance) || 0,
        })),
      );
    } catch (error) {
      console.error("Error fetching user balances:", error);
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedUser || !amount) return;

    try {
      const response = await fetch("/api/v1/admin/process-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        alert("Withdrawal processed successfully");
        setSelectedUser(null);
        setAmount("");
        fetchUserBalances();
      } else {
        const errorData = await response.json();
        alert(`Error processing withdrawal: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Error processing withdrawal");
    }
  };

  const getReferralUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/register?ref=${referralCode}`;
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(getReferralUrl()).then(() => {
      setShowCopiedMessage(true);
    });
  };

  const formatBalance = (
    balance: number | string | null | undefined,
  ): string => {
    if (typeof balance === "number") {
      return balance.toFixed(2);
    } else if (typeof balance === "string") {
      const parsed = parseFloat(balance);
      return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
    } else {
      return "0.00";
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h4" gutterBottom>
        Affiliate Dashboard
      </Typography>
      <div className="flex items-center mb-4">
        <Typography variant="h6" className="mr-4">
          Your Referral URL:
        </Typography>
        <TextField
          value={getReferralUrl()}
          variant="outlined"
          size="small"
          className="flex-grow mr-2"
          InputProps={{
            readOnly: true,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<ContentCopy />}
          onClick={copyReferralUrl}
        >
          Copy
        </Button>
      </div>
      <Typography variant="h6">
        Available Balance: ${formatBalance(balance)}
      </Typography>

      <TableContainer component={Paper} className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Referred User</TableCell>
              <TableCell align="right">Commission</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrals.map((referral, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {referral.referredUsername}
                </TableCell>
                <TableCell align="right">
                  ${formatBalance(referral.commission)}
                </TableCell>
                <TableCell align="right">
                  {new Date(referral.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" className="mt-4">
        Request Withdrawal
      </Button>

      {isAdmin && (
        <>
          <Typography variant="h4" gutterBottom className="mt-8">
            Admin Affiliate Panel
          </Typography>

          <TableContainer component={Paper} className="mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell component="th" scope="row">
                      {user.username}
                    </TableCell>
                    <TableCell align="right">
                      ${formatBalance(user.balance)}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        Process Withdrawal
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedUser && (
            <div className="mt-4">
              <Typography variant="h6">Process Withdrawal</Typography>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mr-2"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleWithdrawal}
              >
                Confirm Withdrawal
              </Button>
              <Snackbar
                open={showCopiedMessage}
                autoHideDuration={3000}
                onClose={() => setShowCopiedMessage(false)}
                message="Referral URL copied to clipboard"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
