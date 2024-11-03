"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { isLoggedIn as ili } from "@/calls";
import { useEffect } from "react";

export default function Home() {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (ili())
      setIsLoggedIn(true)
    else
      setIsLoggedIn(false)
    if (!isLoggedIn)
      router.push('/auth/login');
  }, [isLoggedIn]);

  return (
    <>
    </>
  );
}
