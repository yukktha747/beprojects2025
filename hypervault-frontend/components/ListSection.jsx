"use client";

import { useEffect, useState, useMemo } from 'react';
import { getPublicPhotos, getPrivateImages, addToFavorites, removeFromFavorites, checkIsFavorite, markImageAsTrash, restoreFromTrash } from '@/calls';
import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function ListSection() {
    const [publicFiles, setPublicFiles] = useState([]);
    const [privateFiles, setPrivateFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMorePublic, setHasMorePublic] = useState(true);
    const [hasMorePrivate, setHasMorePrivate] = useState(true);
    const [pagePublic, setPagePublic] = useState(1);
    const [pagePrivate, setPagePrivate] = useState(1);
    const [isMounted, setIsMounted] = useState(false); // Ensure it's mounted on the client
    const [showPublicFiles, setShowPublicFiles] = useState(true); // For toggling public/private files
    const [modalOpen, setModalOpen] = useState(false); // For opening modal
    const [selectedFile, setSelectedFile] = useState(null); // Store the selected file for modal
    const [dropdownVisible, setDropdownVisible] = useState(null); // Track which dropdown is open
    const router = useRouter();

    // This ensures fetch logic runs only on the client side after the initial render
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            if (showPublicFiles) {
                // Fetch public files
                const publicFilesData = await getPublicPhotos(pagePublic);
                setPublicFiles(prevFiles => [...prevFiles, ...publicFilesData.results.files]);
                setHasMorePublic(publicFilesData.hasMore);
                setPagePublic(prevPage => prevPage + 1);
            } else {
                // Fetch private files
                const privateFilesData = await getPrivateImages(pagePrivate);
                console.log(privateFilesData.results.files);
                setPrivateFiles(prevFiles => [...prevFiles, ...privateFilesData.results.files]);
                setHasMorePrivate(privateFilesData.hasMore);
                setPagePrivate(prevPage => prevPage + 1);
            }
        } catch (err) {
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const memoizedPublicFiles = useMemo(() => publicFiles, [publicFiles]);
    const memoizedPrivateFiles = useMemo(() => privateFiles, [privateFiles]);

    // Use useMemo to store the files and avoid unnecessary API calls when switching tabs
    useEffect(() => {
        if (isMounted) {
            // Only fetch files if they are not already loaded
            if (showPublicFiles && publicFiles.length === 0) {
                fetchFiles();
            } else if (!showPublicFiles && privateFiles.length === 0) {
                fetchFiles();
            }
        }
    }, [isMounted, showPublicFiles]);

    const handleFavoriteToggle = async (fileId, isFavorite) => {
        try {
            if (isFavorite) {
                await removeFromFavorites(fileId);
            } else {
                await addToFavorites(fileId);
            }
            fetchFiles();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await markImageAsTrash(fileId);
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleRestore = async (fileId) => {
        try {
            await restoreFromTrash(fileId);
            fetchFiles();
        } catch (error) {
            console.error('Error restoring file:', error);
        }
    };

    const handleConvertToPrivate = async (fileId) => {
        try {
            await convertFileToPrivate(fileId);
            fetchFiles();
        } catch (error) {
            console.error('Error converting to private:', error);
        }
    };

    const handleConvertToPublic = async (fileId) => {
        try {
            await convertFileToPublic(fileId);
            fetchFiles();
        } catch (error) {
            console.error('Error converting to public:', error);
        }
    };

    const handleFileClick = (file) => {
        const fileExtension = file.url.split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            setSelectedFile(file);
            setModalOpen(true);
        } else {
            alert('File format not supported for preview.');
        }
    };

    const toggleDropdown = (fileId) => {
        setDropdownVisible(dropdownVisible === fileId ? null : fileId);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedFile(null);
    };

    if (!isMounted) {
        return null; // Prevent rendering on SSR
    }

    return (
        <div className="w-full min-h-screen p-4 mt-[120px]"> {/* Added margin-top for navbar space */}
            {error && <div className="text-red-500">{error}</div>}

            {/* Toggle buttons for public and private files */}
            <div className="mb-4 flex gap-4 justify-center">
                <button
                    onClick={() => setShowPublicFiles(true)}
                    className={`p-2 rounded-md ${showPublicFiles ? 'bg-red-500 text-white' : 'bg-red-200'}`}
                >
                    Public Files
                </button>
                <button
                    onClick={() => setShowPublicFiles(false)}
                    className={`p-2 rounded-md ${!showPublicFiles ? 'bg-red-500 text-white' : 'bg-red-200'}`}
                >
                    Private Files
                </button>
            </div>

            {/* Public Files Section */}
            {showPublicFiles && (
                <div className="mb-8">
                    <h2 className="text-2xl mb-4">Public Files</h2>
                    <InfiniteScroll
                        dataLength={memoizedPublicFiles.length}
                        next={fetchFiles}  // Fetch more files when scrolled to the bottom
                        hasMore={hasMorePublic}
                        loader={<div>Loading...</div>}
                        endMessage={<div></div>}
                    >
                        <div className="grid grid-cols-3 gap-4 w-30 h-30">
                            {memoizedPublicFiles.map((file) => (
                                <div key={file.id} className="p-4 relative">
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-contain"
                                        onClick={() => handleFileClick(file)}
                                    />
                                    <p className="text-center mt-2">{file.url.split('/').pop()}</p> {/* Display file name */}

                                    <div className="absolute top-2 right-2">
                                        <button className="text-lg" onClick={() => toggleDropdown(file.id)}>...</button>
                                        {dropdownVisible === file.id && (
                                            <div className="absolute bg-white text-primary text-sm w-36 border p-2 shadow-lg flex flex-col items-start gap-2">
                                                <button onClick={() => handleFavoriteToggle(file.id, file.isFavorite)}>
                                                    {file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                                </button>
                                                <button onClick={() => handleDelete(file.id)}>Delete</button>
                                                <button onClick={() => handleConvertToPrivate(file.id)}>Convert to Private</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
            )}

            {/* Private Files Section */}
            {!showPublicFiles && (
                <div>
                    <h2 className="text-2xl mb-4">Private Files</h2>
                    <InfiniteScroll
                        dataLength={memoizedPrivateFiles.length}
                        next={fetchFiles}  // Fetch more files when scrolled to the bottom
                        hasMore={hasMorePrivate}
                        loader={<div>Loading...</div>}
                        endMessage={<div></div>}
                    >
                        <div className="grid grid-cols-3 gap-4">
                            {memoizedPrivateFiles.map((file) => (
                                <div key={file.id} className="w-24 h-30 border p-4 relative">
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="object-cover w-full h-full"
                                        onClick={() => handleFileClick(file)}
                                    />
                                    <p className="text-center mt-2">{file.url.split('/').pop()}</p> {/* Display file name */}

                                    <div className="absolute top-2 right-2">
                                        <button className="text-lg" onClick={() => toggleDropdown(file.id)}>...</button>
                                        {dropdownVisible === file.id && (
                                            <div className="absolute bg-white border p-2 shadow-lg">
                                                <button onClick={() => handleFavoriteToggle(file.id, file.isFavorite)}>
                                                    {file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                                </button>
                                                <button onClick={() => handleDelete(file.id)}>Delete</button>
                                                <button onClick={() => handleConvertToPublic(file.id)}>Convert to Public</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
            )}

            {/* Modal for Image or File Preview */}
            {modalOpen && selectedFile && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 max-w-lg mx-auto">
                        <button className="absolute top-2 right-2" onClick={closeModal}>Close</button>
                        {['jpg', 'jpeg', 'png', 'gif'].includes(selectedFile.url.split('.').pop()) ? (
                            <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-auto" />
                        ) : (
                            <p>Cannot preview this file format.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
