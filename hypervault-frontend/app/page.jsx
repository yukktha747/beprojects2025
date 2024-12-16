"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { isLoggedIn as ili } from "@/calls";
import { getPrivateDocuments, getPublicDocuments } from "@/calls";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ListSection = dynamic(() => import("@/components/ListSection"), {
  ssr: false,
});

export default function Home() {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("public");
  const [publicFiles, setPublicFiles] = useState([]);
  const [privateFiles, setPrivateFiles] = useState([]);
  const publicFilesOffset = useRef(0);
  const privateFilesOffset = useRef(0);
  const limit = useRef(50);
  const router = useRouter();

  const getMore = async () => {
    if (type === "public") {
      publicFilesOffset.current += limit.current;
      const newData = await getPublicDocuments(limit.current, publicFilesOffset.current);
      if (newData) {
        setPublicFiles((prev) => [...prev, ...newData]);
      }
    } else {
      privateFilesOffset.current += limit.current;
      const newData = await getPrivateDocuments(limit.current, privateFilesOffset.current);
      if (newData) {
        setPrivateFiles((prev) => [...prev, ...newData]);
      }
    }
  };

  const checkAuthentication = async () => {
    const loggedIn = await ili();
    setIsLoggedIn(loggedIn);
    if (!loggedIn) router.push("/auth/login");
  };

  const getData = async () => {
    const publicData = await getPublicDocuments(limit.current, publicFilesOffset.current);
    const privateData = await getPrivateDocuments(limit.current, privateFilesOffset.current);
    if (publicData) setPublicFiles(publicData);
    if (privateData) setPrivateFiles(privateData);
  };

  useEffect(() => {
    checkAuthentication();
  }, []); // Only runs once on component mount.

  useEffect(() => {
    if (isLoggedIn) getData();
    else router.push('/auth/login');
  }, [isLoggedIn]); // Runs when `isLoggedIn` changes.

  return (
    <>
      {isLoggedIn && (
        <div className="mt-36">
          <div className="flex flex-wrap justify-center w-full">
            <button
              onClick={() => setType("public")}
              className={`p-2 flex-1 border-b-[1px] ${type === "public" ? "border-red-500" : "border-slate-500"
                }`}
            >
              Public
            </button>
            <button
              onClick={() => setType("private")}
              className={`p-2 flex-1 border-b-[1px] ${type === "private" ? "border-red-500" : "border-slate-500"
                }`}
            >
              Private
            </button>
          </div>
          <ListSection
            type={type}
            data={type === "public" ? publicFiles : privateFiles}
            getMore={getMore}
            refreshData={getData}
          />
        </div>
      )}
    </>
  );
}
