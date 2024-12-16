import Link from "next/link"
import { useState, useEffect } from "react";
import { GrHomeRounded, GrCloudUpload, GrLogout } from "react-icons/gr";
import { MdOutlineAdminPanelSettings, MdSunny } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { FaRegStar, FaRegTrashAlt, FaMoon } from "react-icons/fa";
import useAuthStore from "@/stores/useAuthStore";

export default function NavLinks() {
    const { isLoggedIn, logout } = useAuthStore();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.body.classList.toggle('light', savedTheme === 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.classList.toggle('light', newTheme === 'light');
    };
    return (
        <>
            {isLoggedIn && (<>
                <Link href="/">
                    <GrHomeRounded />
                </Link>
                <Link href="/upload">
                    <GrCloudUpload />
                </Link>
                <Link href="/favorites">
                    <FaRegStar />
                </Link>
                <Link href="/trash">
                    <FaRegTrashAlt />
                </Link>
                <button onClick={() => logout()}>
                    <GrLogout />
                </button></>)}
            {!isLoggedIn && (<>
                <Link href="/">
                    <IoPersonOutline />
                </Link></>)}
            <Link href="/">
                <MdOutlineAdminPanelSettings />
            </Link>
            <button onClick={toggleTheme}>
                {theme == "dark" ? <MdSunny /> : <FaMoon />}
            </button>
        </>
    )
}
