"use client";

import { useState } from "react";
import Link from "next/link";
import { GrMenu, GrClose } from "react-icons/gr";
import NavLinks from "./NavLinks";
import Search from "./Search";

export default function Navbar() {
    const [menu, setMenu] = useState(false);
    return (
        <>
        <div className="shadow-lg flex flex-col gap-3 fixed top-10 left-1/2 -translate-x-1/2 p-3 w-[90vw] bg-secondary text-primary h-fit rounded-2xl opacity-90 backdrop-blur-md z-50">
            <div className="flex gap-5 justify-between items-center">
                <Link href="/">
                    <h1 className="text-2xl font-bold">HyperVault</h1>
                </Link>
                <Search />
                <nav className="lg:flex gap-2 items-center text-lg hidden font-light">
                    <NavLinks />
                </nav>
                <button onClick={() => setMenu(m => !m)} className="block lg:hidden text-2xl">
                    {!menu ? <GrMenu /> : <GrClose />}
                </button>
            </div>
            <div className={`${menu ? 'flex': 'hidden'} gap-3 flex-col justify-center items-center`}>
                <Search small={true} />
                <div className="flex justify-around items-center gap-5 w-full text-2xl font-light">
                    <NavLinks />
                </div>
            </div>
        </div>
        </>
    )
}
