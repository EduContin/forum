// app/affiliate/page.tsx

"use client";

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
} from "@mui/material";
import { redirect } from "next/navigation";

interface ReferralData {
  referredUsername: string;
  commission: number;
  createdAt: string;
}

interface UserBalance {
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
  const [users, setUsers] = useState<UserBalance[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

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
        redirect: "follow", // This will automatically follow redirects
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReferrals(data.referrals);
      setBalance(parseFloat(data.balance) || 0); // Ensure balance is a number
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };

  const fetchUserBalances = async () => {
    const response = await fetch("/api/v1/admin/user-balances");
    const data = await response.json();
    setUsers(data);
  };

  const handleWithdrawal = async () => {
    if (!selectedUser || !amount) return;

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
      alert("Error processing withdrawal");
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
      <Typography variant="h6">Your Referral Code: {referralCode}</Typography>
      <Typography variant="h6">
        Available Balance: ${balance.toFixed(2)}
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
                  ${referral.commission.toFixed(2)}
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
                      ${user.balance.toFixed(2)}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
