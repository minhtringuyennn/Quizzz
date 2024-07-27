"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import Quiz from "@/components/Quiz";
import AdminLogin from "@/components/AdminLogin";

let socket;

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminKey = localStorage.getItem("adminKey");
    if (adminKey) {
      verifyAdminKey(adminKey);
    } else {
      setIsLoading(false);
    }

    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to socket");
    });
  };

  const verifyAdminKey = async (adminKey) => {
    try {
      const res = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey })
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      localStorage.setItem("adminKey", adminKey);
    } catch (error) {
      console.error("Error verifying admin key:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (adminKey) => {
    setIsLoading(true);
    await verifyAdminKey(adminKey);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-4/5 items-center justify-between text-sm flex flex-col gap-4">
        {!isAdmin && <AdminLogin onLogin={handleAdminLogin} />}
        {!isLoading && <Quiz isAdmin={isAdmin} />}
      </div>
    </main>
  );
}
