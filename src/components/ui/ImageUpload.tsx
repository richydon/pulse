"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, GIF, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Image upload is not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
      }

      const data = await res.json();
      onChange(data.secure_url as string);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed — try again");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  if (value) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-[#F3F4F6] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Bounty cover"
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          title="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-0.5 text-xs text-white">
          Cover image
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // reset so same file can be re-selected
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors
          ${dragOver
            ? "border-[#111827] bg-[#F3F4F6]"
            : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          }
          ${uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {uploading ? (
          <>
            <div className="w-9 h-9 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#6B7280]">Uploading...</span>
          </>
        ) : (
          <>
            <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#6B7280]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#111827]">
                {dragOver ? "Drop to upload" : "Upload cover image"}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">PNG, JPG, GIF, WebP — max 5 MB</p>
            </div>
          </>
        )}
      </button>
      {error && <p className="text-xs text-[#EF4444] mt-1.5">{error}</p>}
    </div>
  );
}
