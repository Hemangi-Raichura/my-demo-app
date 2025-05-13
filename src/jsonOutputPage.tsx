import React, { useEffect, useState } from "react";

const ReviewPage: React.FC = () => {
  const [jsonOutput, setJsonOutput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("webformData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const dataArray = Array.isArray(parsed) ? parsed : parsed.data;
        const simplified = dataArray.map((item: any) => ({
          RowId: item.RowId,
          Value: item.Value,
          Value2: item.Value2,
        }));
        setJsonOutput(JSON.stringify(simplified, null, 2));
      } catch (err) {
        setJsonOutput("// Error parsing JSON from localStorage.");
      }
    } else {
      setJsonOutput("// No data found in localStorage.");
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Review JSON Output</h2>
      <textarea
        className="w-full h-[500px] font-mono p-4 border rounded bg-gray-50 text-sm"
        value={jsonOutput}
        readOnly
      />
    </div>
  );
};

export default ReviewPage;
