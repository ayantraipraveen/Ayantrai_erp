"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export default function Home() {
  const router = useRouter();
  const authentication = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (authentication.isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/signin");
    }
  }, [router, authentication.isAuthenticated]);

  return null;
}
