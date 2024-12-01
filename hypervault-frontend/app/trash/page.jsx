"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { isLoggedIn as ili } from "@/calls";
import { getUserTrash } from "@/calls";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
const ListSection = dynamic(() => import('@/components/ListSection'), {
    ssr: false,
});

export default function Trash() {
    const { isLoggedIn, setIsLoggedIn } = useAuthStore();
    const [files, setFiles] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (ili())
            setIsLoggedIn(true)
        else
            setIsLoggedIn(false)
        if (!isLoggedIn)
            router.push('/auth/login');
    }, [isLoggedIn]);

    async function getData() {
        setFiles(await getUserTrash());
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="mt-36">
            <ListSection data={files} refreshData={getData} />
        </div>
    );
}
