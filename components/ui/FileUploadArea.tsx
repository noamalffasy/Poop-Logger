"use client";

import { File, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { parseJsonLines } from "@/lib/parseJsonLines";
import { cn } from "@/lib/utils";
import { setData } from "@/store/dataSlice";

export default function FileUploadArea() {
  const [fileName, setFileName] = useState<string>("");
  const dispatch = useDispatch();

  const handleFileUpload = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsedData = parseJsonLines(content);
        dispatch(setData(parsedData));
      };
      reader.readAsText(file);
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json", ".jsonl"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "text-muted-foreground",
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary" : "hover:border-accent"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12" />
      <p className="mt-2 text-sm">
        {isDragActive
          ? "Drop the file here"
          : "Drag and drop a JSON Lines file here, or click to select a file"}
      </p>
      {fileName && (
        <div className="mt-4 flex items-center justify-center text-sm">
          <File className="mr-2 h-4 w-4" />
          {fileName}
        </div>
      )}
    </div>
  );
}
