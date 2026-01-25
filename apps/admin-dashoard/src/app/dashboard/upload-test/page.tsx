"use client";

import { useEffect, useState } from "react";
import { onFirebaseAuthStateChanged, User } from "@repo/firebase/client";
import { useRouter } from "next/navigation";

export default function UploadTestPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onFirebaseAuthStateChanged((user) => {
            if (!user) {
                router.push("/signin");
            } else {
                setUser(user);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !user) return;

        setStatus("Initiating upload...");
        try {
            const idToken = await user.getIdToken();
            const response = await fetch("http://localhost:8080/api/v0/upload/initiate-upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    filename: file.name,
                    size: file.size,
                    mimeType: file.type
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to initiate upload");

            const { fileId, strategy, preSignedUrls } = data;

            if (strategy === "SINGLE_PART") {
                setStatus("Uploading to S3...");
                const uploadUrl = preSignedUrls[0];

                const s3Response = await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type
                    }
                });

                if (!s3Response.ok) throw new Error("Failed to upload to S3");

                setStatus("Completing upload...");
                const completeResponse = await fetch("http://localhost:8080/api/v0/upload/complete-upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${idToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fileId: fileId
                    })
                });

                if (!completeResponse.ok) throw new Error("Failed to complete upload");
                setStatus("Upload successful!");
            } else {
                setStatus("Multipart upload not implemented in this test page yet.");
            }
        } catch (err: any) {
            console.error(err);
            setStatus("Error: " + err.message);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Upload API Test</h1>
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">User: {user?.email}</p>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            <button
                onClick={handleUpload}
                disabled={!file}
                className="w-full bg-blue-600 text-white py-2  font-semibold disabled:bg-gray-400"
            >
                Upload File
            </button>
            {status && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-sm break-all">
                    {status}
                </div>
            )}
            <div className="mt-8">
                <a href="/signin" className="text-blue-500 underline">Back to Sign In</a>
            </div>
        </div>
    );
}
