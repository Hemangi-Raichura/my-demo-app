// JsonInputPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JsonInputPage: React.FC = () => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) && !parsed.data) {
        throw new Error("Expected an array or object with 'data' array.");
      }

      // Either use parsed directly or parsed.data based on your schema
      const fields = parsed.data ?? parsed;

      localStorage.setItem("webformData", JSON.stringify(fields));
      navigate("/App2"); // assuming "/" is the form page
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Paste JSON Data</h2>
      <textarea
        className="w-full h-64 p-4 border rounded font-mono"
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setError("");
        }}
        placeholder='Paste your JSON here...'
      />
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Submit & Load Form
      </button>
    </div>
  );
};

export default JsonInputPage;
