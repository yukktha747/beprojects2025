"use client";

import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { isLoggedIn as ili, search } from "@/calls";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ListSection = dynamic(() => import("@/components/ListSection"), {
  ssr: false,
});

export default function Search() {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("query");
  const documentType = searchParams.get("type");

  useEffect(() => {
    if (ili()) setIsLoggedIn(true);
    else setIsLoggedIn(false);
    if (!isLoggedIn) router.push("/auth/login");
  }, [isLoggedIn]);

  async function getData() {
    if (searchQuery) {
      const results = await search(searchQuery, documentType);
      setFiles(results);
    }
  }

  useEffect(() => {
    getData();
  }, [searchQuery, documentType]);

  return (
    <div className="mt-36">
      <ListSection data={files} refreshData={getData} />
    </div>
  );
}
