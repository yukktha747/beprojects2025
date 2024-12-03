"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { isLoggedIn as ili } from "@/calls";
import { getPrivateDocuments, getPrivateImages, getPublicDocuments, getPublicImages } from "@/calls";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
const ListSection = dynamic(() => import('@/components/ListSection'), {
  ssr: false,
});

export default function Home() {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();
  const { files, setFiles } = useState();
  const [type, setType] = useState("public");
  const [publicFiles, setPublicFiles] = useState([]);
  const [privateFiles, setPrivateFiles] = useState([]);
  const [publicFilesOffset, setPublicFilesOffset] = useState(0);
  const [privateFilesOffset, setPrivateFilesOffset] = useState(0);
  const limit = 50;
  const router = useRouter();

  function getMore() {
    if (type == 'public') {
      setPublicFilesOffset(val => val + limit);
      async function get() {
        setPublicFiles([...publicFiles, await getPublicDocuments(limit, publicFilesOffset)]);
      } get();
    } else {
      setPrivateFilesOffset(val => val + limit);
      async function get() {
        setPrivateFiles([...privateFiles, await getPrivateDocuments(limit, privateFilesOffset)]);
      } get();
    }
  }

  useEffect(() => {
    if (ili())
      setIsLoggedIn(true)
    else
      setIsLoggedIn(false)
    if (!isLoggedIn)
      router.push('/auth/login');
  }, [isLoggedIn]);

  async function getData() {
    setPublicFiles(await getPublicDocuments(limit, publicFilesOffset));
    setPrivateFiles(await getPrivateDocuments(limit, privateFilesOffset));
  }

  useEffect(() => {
    async function getData() {
      setPublicFiles(await getPublicDocuments(limit, publicFilesOffset));
      setPrivateFiles(await getPrivateDocuments(limit, privateFilesOffset));
    }
    getData();
  }, []);

  return (
    <>
      {isLoggedIn && (
        <div className="mt-36">
          <div className="flex flex-wrap justify-center w-full">
            <button onClick={() => setType("public")} className={`p-2 flex-1 border-b-[1px] ${type == 'public' ? 'border-slate-300' : 'border-slate-500'}`}>Public</button>
            <button onClick={() => setType("private")} className={`p-2 flex-1 border-b-[1px] ${type == 'private' ? 'border-slate-300' : 'border-slate-500'}`}>Private</button>
          </div>
          <ListSection type={type} data={type == 'public' ? publicFiles : privateFiles} getMore={getMore} refreshData={getData} />
        </div>
      )}
    </>
  );
}
