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

interface RepoDetails {
  owner: string;
  repo: string;
  branch?: string;
  folderPath?: string;
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repoOwner, setRepoOwner] = useState<RepoOwner | null>(null);
  const [repoName, setRepoName] = useState("");

  const extractRepoDetails = (url: string): RepoDetails | null => {
    const match = url.match(
      /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)\/?(.*))?/,
    );

    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2],
      branch: match[3],
      folderPath: match[4] || "",
    };
  };

  const fetchImages = async () => {
    setImages([]);
    setError("");
    setRepoOwner(null);
    setRepoName("");
    setLoading(true);

    const repoDetails = extractRepoDetails(link);

    if (!repoDetails) {
      setError("Invalid GitHub repository URL.");
      setLoading(false);
      return;
    }

    const { owner, repo, branch: branchFromUrl, folderPath } = repoDetails;
    setRepoName(repo);

    const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
      const repoResponse = await fetch(repoApiUrl);

      if (!repoResponse.ok)
        throw new Error("Failed to fetch repository details");

      const repoData = await repoResponse.json();

      const defaultBranch = repoData.default_branch;
      const branch = branchFromUrl || defaultBranch;

      setRepoOwner({
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
      });

      const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${branch}`;

      const response = await fetch(contentsUrl);

      if (!response.ok) throw new Error("Failed to fetch repository contents");

      const data: GitHubFile[] = await response.json();

      const imageFiles = data
        .filter(
          (file) =>
            file.type === "file" && /\.(png|jpe?g|gif|webp)$/i.test(file.name),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-10">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">WallFetch</h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter GitHub repo or folder URL..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white h-10"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Fetch"}
          </Button>
        </form>

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
                <Link href={src} target="_blank" rel="noopener noreferrer">
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
