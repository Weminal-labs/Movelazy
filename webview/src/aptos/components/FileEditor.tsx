"use client";

import { useState } from "react";
import { type CodeFile } from "../lib/types";
import { FileGrid } from "./FileGrid";
import { EditorDialog } from "./EditorDialog";
import axios from 'axios';

interface FileEditorProps {
  files: CodeFile[];
}

export function FileEditor({ files }: FileEditorProps) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value && selectedFile) {
      setCode(value);
    }
  };

  const handleRun = async (inputs?: Record<string, any>) => {
    setIsRunning(true);
    setResult(""); // Clear previous results

    try {
      // Extract command details from code if it contains "call function"
      const message = {
        role: "user",
        content: code
      };

      const response = await axios.post("http://localhost:3000/api",
        {
          messages: [message],  // Wrap message in array as server expects
          show_intermediate_steps: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Handle plain text response
      if (typeof response.data === 'string') {
        setResult(response.data);
      }
      // Handle stream response
      else if (response.data.getReader) {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setResult(prev => prev + chunk);
        }
      }

    } catch (error) {
      console.error("Error running code:", error);
      setResult(
        `Error: ${axios.isAxiosError(error) ? error.message : "Unknown error occurred"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const openFile = (file: CodeFile) => {
    setSelectedFile(file);
    setCode(file.content);
    setResult("");
    setIsRunning(false);
    console.log("check monaco editor", file.content);
  };

  const closeFile = () => {
    setSelectedFile(null);
    setCode("");
    setResult("");
    setIsRunning(false);
  };

  return (
    <>
      <FileGrid files={files} onFileSelect={openFile} />

      <EditorDialog
        file={selectedFile}
        code={code}
        result={result}
        isRunning={isRunning}
        onClose={closeFile}
        onCodeChange={handleEditorChange}
        onRun={handleRun}
        onBack={() => setResult("")}
      />
    </>
  );
}
