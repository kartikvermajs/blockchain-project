"use client";
import { signOut } from "@/actions/auth";
import React, { useState } from "react";
import { Button } from "./Button";

const Logout = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    await signOut();
    setLoading(false);

    window.location.href = "/";
  };

  return (
    <div>
      <form onSubmit={handleLogout}>
        <Button type="submit" disabled={loading}>
          {loading ? "Signing out..." : "Sign out"}
        </Button>
      </form>
    </div>
  );
};

export default Logout;
