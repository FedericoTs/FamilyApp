import React from "react";
import Profile from "../pages/Profile";
import { AuthProvider } from "../contexts/AuthContext";

export default function ProfilePageStoryboard() {
  return (
    <AuthProvider>
      <Profile />
    </AuthProvider>
  );
}
