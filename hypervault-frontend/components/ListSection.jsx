import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FilePreviewerThumbnail } from "react-file-previewer";
import { FaFile } from "react-icons/fa";
import { CgMoreR } from "react-icons/cg";
import { PiButterflyDuotone } from "react-icons/pi";
import { addToFavorites, removeFromFavorites, checkIsFavorite, changeFilePrivacy, markAsTrash, restoreFromTrash } from "@/calls";
import Link from "next/link";

export default function ListSection({ type, data, getMore, refreshData }) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const selectedFile = useRef(null);
    const [fav, setFav] = useState(false);
    const pathname = usePathname();
    const isTrashPage = pathname === "/trash";
    const containerRef = useRef(null);
    const [summary, setSummary] = useState(null);

    const handleMenuButtonClick = async (event, id, summary) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 300;
        const screenWidth = window.innerWidth;
    
        const availableSpaceRight = screenWidth - rect.right;
    
        let adjustedMenuPosition = {
            x: rect.left,
            y: rect.bottom,
        };
    
        if (availableSpaceRight < menuWidth) {
            adjustedMenuPosition.x = rect.left - menuWidth;
        }
    
        selectedFile.current = id;
        setSummary(summary);
        setFav(await checkFav(id));
        setIsMenuVisible(true);
        setMenuPosition(adjustedMenuPosition);
    };
    

    function getFileName(url) {
        if (url) {
            const splits = url.split("/");
            return splits[splits.length - 1];
        }
    }

    const handleClickOutside = () => {
        setIsMenuVisible(false);
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    async function checkFav(id) {
        return await checkIsFavorite(id);
    }

    async function removeFav(id) {
        await removeFromFavorites(id);
        refreshData();
        setFav(false);
    }

    async function addFav(id) {
        await addToFavorites(id);
        setFav(true);
    }

    async function handleChangeFilePrivacy(id) {
        await changeFilePrivacy(id, type == 'public' ? 'private' : 'public');
        refreshData();
    }

    async function handleTrashIt(id) {
        await markAsTrash(id);
        refreshData();
    }

    async function handleRestore(id) {
        await restoreFromTrash(id);
        refreshData();
    }

    const handleScroll = () => {
        const container = containerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollTop + clientHeight >= scrollHeight - 50) { // Adjust the threshold for triggering 'getMore'
                if (getMore) {
                    getMore();
                }
            }
        }
    };

    return data.length !== 0 ? (
        <div className="m-5" ref={containerRef} onScroll={handleScroll} style={{ maxHeight: "500px", overflowY: "auto" }}>
            {isMenuVisible && (
                <div
                    className="absolute bg-white border shadow-lg text-primary moremenu max-w-md"
                    style={{
                        top: menuPosition.y,
                        left: menuPosition.x,
                        zIndex: 1000,
                    }}
                >
                    <ul className="list-none m-0 duration-300 text-sm">
                        <>
                            <li className="hover:!bg-white hover:!text-primary">{summary && <span>Summary: {summary}</span>}</li>
                            <li
                                onClick={() =>
                                    fav
                                        ? removeFav(selectedFile.current)
                                        : addFav(selectedFile.current)
                                }
                            >
                                {fav ? "Remove from favorites" : "Add to favorites"}
                            </li>
                            {type && (
                                <li onClick={() => handleChangeFilePrivacy(selectedFile.current)}>Mark {`${type == 'public' ? 'private' : 'public'}`}</li>
                            )}
                            <li onClick={() => isTrashPage ? handleRestore(selectedFile.current) : handleTrashIt(selectedFile.current)}>{isTrashPage ? "Restore" : "Trash it"}</li>
                        </>
                    </ul>
                </div>
            )}
            {/* <div className="flex flex-wrap gap-5"> */}
            <div className="overflow-x-hidden grid w-full text-center justify-center grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {data.map((file, index) => (
                    <div key={index} className="w-28 h-36 text-center">
                        <div className="relative">
                            <button
                                onClick={(event) => handleMenuButtonClick(event, file.id, file?.summary || null)}
                                className="absolute z-10 text-red-500/50 right-1 top-1 text-2xl duration-300 cursor-pointer hover:text-red-500"
                            >
                                <CgMoreR />
                            </button>
                            <div target="_blank" className="overflow-hidden h-28 w-28">
                                <Link href={file.url} target="_blank">
                                    {["pdf", "docx", "pages", "xlsx", "numbers"].includes(getFileName(file.url).split(".").pop()) ? <FaFile className="text-8xl" /> : <FilePreviewerThumbnail key={index} file={{ url: file.url }} />}
                                </Link>
                            </div>
                        </div>
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis text-center block">
                            {getFileName(file.url)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    ) : (<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center">
            <PiButterflyDuotone className="text-[20rem] text-red-500" />
            <h2 className="text-center text-3xl font-bold">Empty</h2>
        </div>
    </div>);
}
