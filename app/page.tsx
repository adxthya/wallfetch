"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url: string;
}

interface RepoOwner {
  login: string;
  avatar_url: string;
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repoOwner, setRepoOwner] = useState<RepoOwner | null>(null);
  const [repoName, setRepoName] = useState("");

  const extractRepoDetails = (url: string) => {
    const match = url.match(
      /github\.com\/([^\/]+)\/([^\/]+)\/tree\/[^\/]+\/(.+)/
    );
    return match
      ? { owner: match[1], repo: match[2], folderPath: match[3] }
      : null;
  };

  const fetchImages = async () => {
    setImages([]);
    setError("");
    setRepoOwner(null);
    setRepoName("");
    setLoading(true);

    const repoDetails = extractRepoDetails(link);
    if (!repoDetails) {
      setError("Invalid GitHub folder URL.");
      setLoading(false);
      return;
    }

    const { owner, repo, folderPath } = repoDetails;
    setRepoName(repo);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;
    const ownerApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
      const ownerResponse = await fetch(ownerApiUrl);
      if (!ownerResponse.ok)
        throw new Error("Failed to fetch repository details");

      const ownerData = await ownerResponse.json();
      setRepoOwner({
        login: ownerData.owner.login,
        avatar_url: ownerData.owner.avatar_url,
      });

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch folder contents");

      const data: GitHubFile[] = await response.json();

      const imageFiles = data
        .filter(
          (file) =>
            file.type === "file" && /\.(png|jpe?g|gif|webp)$/i.test(file.name)
        )
        .map((file) => file.download_url);

      if (imageFiles.length === 0)
        throw new Error("No images found in the folder.");

      setImages(imageFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-10">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">WallFetch</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter GitHub folder URL..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white h-10"
          />
          <Button
            onClick={fetchImages}
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {repoOwner && (
        <div className="flex items-center gap-4 mt-6 p-4 bg-gray-900 rounded-lg shadow-md">
          <Image
            src={repoOwner.avatar_url}
            alt="Owner Avatar"
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <p className="text-lg font-semibold">{repoOwner.login}</p>
            <p className="text-sm text-gray-400">{repoName}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {images.map((src, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-md">
              <CardContent className="p-2">
                <Link
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={src}
                    alt={`Image ${index}`}
                    width={300}
                    height={200}
                    className="rounded-lg w-full h-auto"
                    loading="lazy"
                  />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
