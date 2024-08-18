"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [avatarUrl, setavatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!session) {
    router.push("/login");
  }

  const updateSetting = async (settingType: string, data: any) => {
    try {
      const response = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingType, ...data }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An error occurred");
      }
    } catch (error) {
      setError(`An error occurred while updating ${settingType}`);
    }
  };

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting("email", { email });
  };

  const handleSignatureUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting("signature", { signature });
  };

  const handleProfilePictureUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting("profilePicture", { avatarUrl });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    updateSetting("password", { currentPassword, newPassword });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="space-y-8">
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Email</h2>
          <div>
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Email
          </button>
        </form>

        <form onSubmit={handleSignatureUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Signature</h2>
          <div>
            <label htmlFor="signature" className="block mb-1">
              Signature
            </label>
            <textarea
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Signature
          </button>
        </form>

        <form onSubmit={handleProfilePictureUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Update Profile Picture</h2>
          <div>
            <label htmlFor="avatarUrl" className="block mb-1">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setavatarUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Profile Picture
          </button>
        </form>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <div>
            <label htmlFor="currentPassword" className="block mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
