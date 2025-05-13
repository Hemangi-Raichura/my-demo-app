import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Field {
  RowId: number;
  Name: string;
  Value: any;
  Frequency: string;
  IEFType: string;
}

const ReviewPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("webformData");
    if (saved) {
      setFields(JSON.parse(saved));
    }
  }, []);

  const total = fields
    .filter((f) => f.IEFType === "N")
    .reduce((sum, f) => sum + (parseFloat(f.Value) || 0), 0);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (!response.ok) throw new Error("Submission failed");

      localStorage.removeItem("webformData");
      alert("Form submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit form.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">Review Your Entries</h1>

      <div className="bg-white shadow p-6 rounded-lg">
        {fields.map((f) => (
          <div key={f.RowId} className="mb-4 border-b pb-2">
            <div className="font-medium text-gray-800">{f.Name}</div>
            <div className="text-gray-600">
              {f.IEFType === "N"
                ? `${f.Value ?? 0} ${f.Frequency ? `(${f.Frequency})` : ""}`
                : f.Value ?? "—"}
            </div>
          </div>
        ))}

        <div className="mt-6 font-semibold text-lg text-right">
          Total: ${total.toFixed(2)}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => navigate("/")}
          >
            Back & Edit
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleSubmit}
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
