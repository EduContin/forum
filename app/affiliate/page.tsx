// app/affiliate/page.tsx

"use client";

import { ContentCopy } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useState, useEffect, ReactNode } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Snackbar,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";

interface ReferralData {
  created_at: string | number | Date;
  referred_username: ReactNode;
  commission: number;
}

interface User {
  id: number;
  username: string;
  balance: number;
}

const styles = {
  container: {
    margin: "0 20px",
    backgroundColor: "#1f2531",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  header: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "rgba(76, 153, 229, 0.1)",
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "#4a90e2",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "10px 15px",
    "&:hover": {
      backgroundColor: "#3b78d6",
    },
  },
  buttonActive: {
    backgroundColor: "#38a169",
    "&:hover": {
      backgroundColor: "#2f855a",
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgba(76, 153, 229, 0.6)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(76, 153, 229, 0.8)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4a90e2",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiInputBase-input": {
      color: "#ffffff",
    },
  },
  table: {
    "& .MuiTableCell-head": {
      backgroundColor: "rgba(76, 153, 229, 0.2)",
      color: "#ffffff",
      fontWeight: "bold",
    },
    "& .MuiTableCell-body": {
      borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
    },
  },
};

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
  const [openWithdrawalDialog, setOpenWithdrawalDialog] = useState(false);

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
      setReferrals(data.referrals);
      setBalance(parseFloat(data.balance) || 0);
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    }
  };

  const fetchUserBalances = async () => {
    try {
      const response = await fetch("/api/v1/admin/user-balances", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
    <Box sx={styles.container}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#ffffff", fontWeight: 300 }}
      >
        Affiliate Dashboard
      </Typography>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={styles.header}>
          <Typography variant="h6" gutterBottom sx={{ color: "#ffffff" }}>
            Instructions
          </Typography>
          <Typography variant="body1" sx={{ color: "#a1a1a6" }}>
            If you refer a person, you get 25% of the registration fee ($2).
            <br />
            If someone you referred refers someone, you get 10% of the
            registration fee ($0.8).
            <br />
            Simply share this link and make money easily!
            <br />
            Grow the community you paid for to access!
          </Typography>
        </Box>

        <Box sx={styles.header}>
          <Typography variant="h6" gutterBottom sx={{ color: "#ffffff" }}>
            Your Referral URL
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                value={getReferralUrl()}
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  readOnly: true,
                  style: {
                    color: "#ffffff",
                    backgroundColor: "rgba(76, 153, 229, 0.1)",
                  },
                }}
                sx={styles.textField}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={copyReferralUrl}
                fullWidth
                sx={styles.button}
              >
                Copy
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={styles.header}>
          <Typography variant="h6" gutterBottom sx={{ color: "#ffffff" }}>
            Available Balance
          </Typography>
          <Typography variant="h4" sx={{ color: "#38a169" }}>
            ${formatBalance(balance)}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenWithdrawalDialog(true)}
            sx={{ ...styles.button, ...styles.buttonActive, mt: 2 }}
          >
            Request Withdrawal
          </Button>
        </Box>

        <Box sx={styles.header}>
          <Typography variant="h6" gutterBottom sx={{ color: "#ffffff" }}>
            Referral History
          </Typography>
          <TableContainer>
            <Table sx={styles.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Referred User</TableCell>
                  <TableCell align="right">Commission</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((referral, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ color: "#ffffff" }}
                      >
                        {referral.referred_username}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#38a169" }}>
                        ${formatBalance(referral.commission)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#ffffff" }}>
                        {new Date(referral.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {isAdmin && (
          <Box sx={styles.header}>
            <Typography variant="h5" gutterBottom sx={{ color: "#ffffff" }}>
              Admin Affiliate Panel
            </Typography>
            <TableContainer>
              <Table sx={styles.table}>
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
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ color: "#ffffff" }}
                      >
                        {user.username}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#38a169" }}>
                        ${formatBalance(user.balance)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Process Withdrawal">
                          <IconButton
                            onClick={() => setSelectedUser(user.id)}
                            sx={{ color: "#4a90e2" }}
                          >
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </motion.div>

      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DialogTitle>Process Withdrawal</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            sx={styles.textField}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedUser(null)}
            sx={{ color: "#4a90e2" }}
          >
            Cancel
          </Button>
          <Button onClick={handleWithdrawal} sx={styles.button}>
            Confirm Withdrawal
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openWithdrawalDialog}
        onClose={() => setOpenWithdrawalDialog(false)}
      >
        <DialogTitle>Request Withdrawal</DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{ color: "#000000", marginBottom: "1rem" }}
          >
            Contact alpened@proton.me with your Bitcoin (BTC) address using the
            same email of your Alpened account, and the amount you want to
            withdraw. Make sure to have enough balance. The minimum withdraw is
            $5.
          </Typography>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={3000}
        onClose={() => setShowCopiedMessage(false)}
        message="Referral URL copied to clipboard"
      />
    </Box>
  );
}
