import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FilePreviewerThumbnail } from "react-file-previewer";
import { FaFile } from "react-icons/fa";
import { CgMoreR } from "react-icons/cg";
import { PiButterflyDuotone } from "react-icons/pi";
import { addToFavorites, removeFromFavorites, checkIsFavorite, changeFilePrivacy, markAsTrash, restoreFromTrash, addTag, removeTag, getTags } from "@/calls";
import Link from "next/link";

export default function ListSection({ type, data, getMore, refreshData }) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const selectedFile = useRef(null);
    const [fav, setFav] = useState(false);
    const [tags, setTags] = useState([]);
    const pathname = usePathname();
    const isTrashPage = pathname === "/trash";
    const containerRef = useRef(null);
    const [summary, setSummary] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const handleMenuButtonClick = async (event, id, summary, index) => {
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

        try {
            const fileTags = await getTags(id);
            setTags(fileTags);
        } catch (error) {
            alert("Failed to fetch tags. Please try again.");
        }

        setIsMenuVisible(true);
        setMenuPosition(adjustedMenuPosition);
        setCurrentFileIndex(index); // Set index of clicked file
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

    async function handleAddTag() {
        const newTag = prompt("Enter the tag you want to add:");
        if (newTag) {
            try {
                await addTag(selectedFile.current, newTag);
                setTags((prevTags) => [...prevTags, newTag]);
            } catch (error) {
                alert("Failed to add tag. Please try again.");
            }
        }
    }

    async function handleRemoveTag() {
        const tagToRemove = prompt("Enter the tag you want to remove:");
        if (tagToRemove) {
            try {
                const res = await removeTag(selectedFile.current, tagToRemove);
                if (res)
                    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
                else
                    alert("Tag is not present");
            } catch (error) {
                alert("Failed to remove tag. Please try again.");
            }
        }
    }

    const handleScroll = () => {
        const container = containerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                if (getMore) {
                    getMore();
                }
            }
        }
    };

    const excludedExtensions = [
        "jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "mp4", "avi", "mov", "mkv", "webm"
    ];

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const nextFile = () => {
        if (currentFileIndex < data.length - 1) {
            setCurrentFileIndex(currentFileIndex + 1);
        }
    };

    const prevFile = () => {
        if (currentFileIndex > 0) {
            setCurrentFileIndex(currentFileIndex - 1);
        }
    };

    // Handle download from the modal
    const handleDownload = () => {
        const fileUrl = data[currentFileIndex]?.url;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = getFileName(fileUrl); // Use the file's name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-600/50 text-white backdrop-blur-lg p-5 rounded-lg w-full max-w-4xl h-full overflow-y-auto">
                        <div className="flex justify-between items-center text-secondary">
                            <button onClick={prevFile}>
                                Previous
                            </button>
                            <button onClick={closeModal}>
                                Close
                            </button>
                            <button onClick={nextFile}>
                                Next
                            </button>
                        </div>
                        <div className="flex justify-center mt-4">
                            {!excludedExtensions.includes(getFileName(data[currentFileIndex]?.url).split(".").pop()) ? (
                                <FaFile className="text-8xl" />
                            ) : (
                                <FilePreviewerThumbnail file={{ url: data[currentFileIndex]?.url }} />
                            )}
                        </div>
                        <div className="mt-4">
                            <h2>{getFileName(data[currentFileIndex]?.url)}</h2>
                            <p>Summary: {data[currentFileIndex]?.summary}</p>
                            <p>Tags: {tags.join(", ") || "No tags"}</p>
                        </div>
                        <div className="flex flex-wrap gap-5 my-5">
                            <Link target="_blank" href={data[currentFileIndex]?.url} className="btn">View</Link>
                            <button onClick={handleDownload} className="btn">Download</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="m-5 overflow-y-auto h-fit" ref={containerRef} onScroll={handleScroll}>
                <div className="overflow-x-hidden grid w-full text-center justify-center grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {data.map((file, index) => (
                        <div key={index} className="w-28 h-36 text-center">
                            <div className="relative">
                                {/* Red button for options */}
                                <div
                                    onClick={(event) => handleMenuButtonClick(event, file.id, file.summary, index)}
                                    className="absolute top-1 right-1 p-1 hover:text-red-500 text-red-500/60 rounded-full cursor-pointer"
                                >
                                    <CgMoreR />
                                </div>
                                <div
                                    onClick={() => {
                                        setCurrentFileIndex(index);
                                        setIsModalOpen(true);
                                    }}
                                    className="cursor-pointer overflow-hidden h-28 w-28 flex justify-center"
                                >
                                    {!excludedExtensions.includes(getFileName(file.url).split(".").pop()) ? (
                                        <FaFile className="text-8xl" />
                                    ) : (
                                        <FilePreviewerThumbnail key={index} file={{ url: file.url }} />
                                    )}
                                </div>
                            </div>
                            <span className="overflow-hidden whitespace-nowrap text-ellipsis text-center block">
                                {getFileName(file.url)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
