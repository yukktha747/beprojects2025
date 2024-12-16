"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFiles } from "@/calls";
import { useRouter } from "next/navigation";

export default function Upload() {
    const [files, setFiles] = useState([]);
    const [privacy, setPrivacy] = useState("public");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Handle file selection via dropzone
    const onDrop = (acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            // "image/*": [],
            // "application/pdf": [],
            // "text/plain": [],
            // "*": [],
        },
        multiple: true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!files.length) {
            setMessage("Please select at least one file to upload.");
            return;
        }
        try {
            setLoading(true);
            const res = await uploadFiles(files, privacy);
            setLoading(false);
            if (res)
                setMessage("Files uploaded successfully!");
            else
                setMessage("Upload failed. Try again.");
            setFiles([]);
            setPrivacy("public");
        } catch (error) {
            setLoading(false);
            setMessage("Upload failed. Try again.");
        }
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md flex flex-col gap-5 rounded-lg p-6">
                <h1 className="text-3xl font-bold text-center">Upload Files</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-primary ${isDragActive ? "bg-secondary" : "bg-secondary"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the files here...</p>
                        ) : (
                            <p>Drag and drop some files here, or click to select files</p>
                        )}
                    </div>

                    {/* Display Selected Files */}
                    {files.length > 0 && (
                        <div className="bg-secondary p-3 text-primary rounded-md shadow-inner max-h-60 overflow-auto">
                            <h2 className="font-semibold mb-2">Selected Files:</h2>
                            <ul className="space-y-2">
                                {files.map((file, index) => (
                                    <li
                                        key={index}
                                        className="flex bg-secondary justify-between items-center text-sm border-b pb-1"
                                    >
                                        <span>{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(file.name)}
                                            className="text-red-500 hover:underline text-xs"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Privacy Selector */}
                    <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="p-2 border rounded-md w-full bg-secondary"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>

                    {/* Upload Button */}
                    <button
                        type="submit"
                        className={`btn ${loading && '!bg-red-500/70'}`}
                        disabled={loading}
                    >
                        {loading ? (<div className="w-6 h-6 flex justify-self-center border-[1px] border-t-white border-b-white/50 rounded-full animate-spin" />) : <>Upload</>}
                    </button>

                    {/* Message */}
                    {message && (
                        <span
                            className={`text-center font-semibold ${message.includes("successfully")
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                        >
                            {message}
                        </span>
                    )}
                </form>
            </div>
        </div>
    );
}
