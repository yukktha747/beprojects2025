"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { useEffect } from "react";

export default function Home() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn)
        router.push('/auth/login');
  }, [isLoggedIn]);

  return (
    <>
    </>
  );
}
