import React from "react";
import { useNavigate } from "react-router-dom";
const API_BASE = "https://apirepo-0bkw.onrender.com"; // 🔁 Replace with your deployed API base


interface Field {
  RowId: number;
  Name: string;
  Category: string;
  SubCategory: string;
  Frequency: string;
  Value: any;
  Value2: string;
  Lov: string;
  Size: number;
  nDecimal: number;
  IEFType: string;
}

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem("webformData");
  const fields: Field[] = saved ? JSON.parse(saved) : [];

  const categories = Array.from(
    new Set(fields.map((f) => f.Category.trim()).filter((cat) => cat !== ""))
  );

  const groupedByCategory: Record<string, Field[]> = {};
  for (const field of fields) {
    const cat = field.Category.trim();
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(field);
  }

  const handleSubmitToAPI = () => {
  fetch(`${API_BASE}/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    })
    .then(() => {
      alert("Form successfully submitted to API!");
       localStorage.removeItem("webformData");
      window.location.href = "/"; // 🔁 Hard reload to clear state
      //navigate("/App2"); // ✅ or redirect anywhere you want
    })
    .catch((err) => {
      console.error("Submission failed:", err);
      alert("Submission failed. Please try again.");
    });
};


  const getPlaceholder = (f: Field): string => {
    if (f.IEFType === "C") return "";
    if (f.IEFType === "N") return f.nDecimal > 0 ? "0.00" : "0";
    return "";
  };

  const getCategoryTotal = (catFields: Field[]) => {
    return catFields.filter(f => f.IEFType === "N")
      .reduce((sum, f) => sum + (parseFloat(f.Value) || 0), 0);
  };

  //const grandTotal = categories.reduce((total, cat) => total + getCategoryTotal(groupedByCategory[cat]), 0);

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Review Your Inputs</h1>

      {categories
        .filter((cat) => groupedByCategory[cat].some(f => f.IEFType !== "H"))
        .map((cat) => (
        <div key={cat} className="border rounded shadow overflow-hidden">
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2">
            <h2 className="text-xl font-semibold">{cat}</h2>
            <button
              onClick={() => navigate(`/?category=${encodeURIComponent(cat)}`)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="w-1/3 px-4 py-2 border">Name</th>
                <th className="w-1/3 px-4 py-2 border">Value</th>
                <th className="w-1/3 px-4 py-2 border">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {groupedByCategory[cat]
                .filter((field) => field.IEFType !== "H")
                .map((field) => {
                 if (field.IEFType === "D" && field.Value) {
  try {
    const d = new Date(field.Value);
    if (!isNaN(d.getTime())) {
      const month = String(d.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      field.Value = `${month}-${day}-${year}`;
    }
  } catch {}
}

                  return (
                    <tr key={field.RowId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 border">{field.Name}</td>
                      <td className="px-4 py-2 border text-gray-700">
                        <input
                          type="text"
                          value={field.Value || ""}
                          placeholder={getPlaceholder(field)}
                          disabled
                          className="w-full bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-2 border text-gray-500">
                       {((field.IEFType === "N" || field.IEFType === "C") && !field.Value2) ? (
    <input type="text" value="" disabled className="w-full bg-transparent" />
  ) : field.Value2 === "NA" ? (
    <input
      type="text"
      value="NA"
      disabled
      className="w-full bg-gray-100 text-gray-500"
    />
  ) : (
    <input
      type="text"
      value={field.Value2}
      disabled
      className="w-full bg-transparent"
    />
  )}
</td>
                    </tr>
                  );
                })}
              <tr>
                <td  className="text-left font-semibold px-4 py-2 border">Total:</td>
                <td className="font-semibold text-left px-4 py-2 border">£{getCategoryTotal(groupedByCategory[cat]).toFixed(2)}</td>
                  <td className="px-4 py-2 border"></td>

              </tr>
            </tbody>
          </table>
        </div>
      ))}

     

      <div className="text-center pt-6">
        <button
          onClick={() => handleSubmitToAPI()}
          className="px-6 py-3 bg-[#ff9933] text-white text-lg font-semibold rounded shadow hover:brightness-110"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;
