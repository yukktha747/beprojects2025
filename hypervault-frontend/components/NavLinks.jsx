import Link from "next/link"
import { GrHomeRounded, GrCloudUpload, GrLogout } from "react-icons/gr";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { FaRegStar, FaRegTrashAlt } from "react-icons/fa";
import useAuthStore from "@/stores/useAuthStore";

export default function NavLinks() {
    const { isLoggedIn, logout } = useAuthStore();
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
        </>
    )
}
