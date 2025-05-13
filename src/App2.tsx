import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMoneyBillWave, FaWallet, FaClipboardCheck, FaUserTie  } from "react-icons/fa";
//import { format, parse } from "date-fns"; // At top of file
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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

const icons: Record<string, React.ReactNode>
 = {
  General: <FaUserTie className="inline-block mr-2"/>,
  Salary: <FaMoneyBillWave className="inline-block mr-2" />,
  Expenses: <FaWallet className="inline-block mr-2" />,
  Test: <FaClipboardCheck  className="inline-block mr-2" />,
};

const frequencyOptions = ["Weekly", "Monthly", "Quarterly", "Annually"];

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const fromCategory = queryParams.get("category")?.trim();

    const saved = localStorage.getItem("webformData");
    if (saved) {
      const data = JSON.parse(saved);
      setFields(data);
      const firstCat = fromCategory || data.find((f: Field) => f.Category.trim())?.Category.trim() || "";
      setActiveCategory(firstCat);
      const firstSub = data.find((f: Field) => f.Category.trim() === firstCat && f.SubCategory.trim())?.SubCategory.trim() || "";
      setActiveSubCategory(firstSub);
    } else {
      /* fetch("/iefields_render_data.json")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const initialized = data.data.map((field: Field) => ({
              ...field,
              Value: field.Value ?? (field.IEFType === "N" ? 0 : ""),
              Frequency: field.Frequency ?? "",
            }));
            setFields(initialized);
            const firstCat = fromCategory || initialized.find((f) => f.Category.trim())?.Category.trim() || "";
            setActiveCategory(firstCat);
            const firstSub = initialized.find((f) => f.Category.trim() === firstCat && f.SubCategory.trim())?.SubCategory.trim() || "";
            setActiveSubCategory(firstSub); 
          }
        }); */
    }
  }, [location.search]);

  useEffect(() => {
    if (fields.length > 0) {
      localStorage.setItem("webformData", JSON.stringify(fields));
    }
  }, [fields]);

  const handleValueChange = (rowId: number, value: any) => {
    setFields((prev) => prev.map((f) => (f.RowId === rowId ? { ...f, Value: value } : f)));
  };

  const handleFrequencyChange = (rowId: number, frequency: string) => {
    setFields((prev) => prev.map((f) => (f.RowId === rowId ? { ...f, Value2: frequency } : f)));
  };

  const handleClear = () => {
    const reset = fields.map((f) => ({
      ...f,
      Value: "",
      Value2: "",
    }));
    setFields(reset);
    localStorage.removeItem("webformData");
  };

  const categoryList = Array.from(new Set(fields.map((f) => f.Category.trim()).filter((cat) => cat !== "")));
  const subCategoryList = Array.from(new Set(fields.filter((f) => f.Category.trim() === activeCategory.trim() && f.SubCategory.trim() !== "").map((f) => f.SubCategory.trim())));
  const hasSubCategories = subCategoryList.length > 0;
  const isLastCategory = activeCategory === categoryList[categoryList.length - 1];
  const isLastSubCategory = !hasSubCategories || activeSubCategory === subCategoryList[subCategoryList.length - 1];
  //const isFirstCategory = activeCategory === categoryList[0];
  const isFirstSubCategory = !hasSubCategories || activeSubCategory === subCategoryList[0];

  const filteredFields = fields.filter((f) => {
    const matchCategory = f.Category.trim() === activeCategory.trim();
    const matchSub = hasSubCategories ? f.SubCategory.trim() === activeSubCategory.trim() : true;
    return matchCategory && matchSub && f.IEFType !== "SH";
  });

  const total = filteredFields.filter((f) => f.IEFType === "N").reduce((sum, f) => sum + (parseFloat(f.Value) || 0), 0);

  
  const handleNext = () => {
    if (hasSubCategories && !isLastSubCategory) {
      const currentIndex = subCategoryList.indexOf(activeSubCategory.trim());
      const nextSub = subCategoryList[currentIndex + 1];
      if (nextSub) {
        setActiveSubCategory(nextSub);
        return;
      }
    }
    if (!hasSubCategories || isLastSubCategory) {
      const currentCategoryIndex = categoryList.indexOf(activeCategory.trim());
      const nextCat = categoryList[currentCategoryIndex + 1];
      if (nextCat) {
        setActiveCategory(nextCat);
        const subcats = fields.filter((f) => f.Category.trim() === nextCat).map((f) => f.SubCategory.trim()).filter((s) => s);
        setActiveSubCategory(subcats[0] || "");
      }
    }
  };

  const handlePrevious = () => {
    if (hasSubCategories && !isFirstSubCategory) {
      const currentIndex = subCategoryList.indexOf(activeSubCategory.trim());
      const prevSub = subCategoryList[currentIndex - 1];
      if (prevSub) {
        setActiveSubCategory(prevSub);
        return;
      }
    }
    if (!hasSubCategories || isFirstSubCategory) {
      const currentCategoryIndex = categoryList.indexOf(activeCategory.trim());
      const prevCat = categoryList[currentCategoryIndex - 1];
      if (prevCat) {
        setActiveCategory(prevCat);
        const prevSubs = fields.filter((f) => f.Category.trim() === prevCat && f.SubCategory);
        const lastSub = prevSubs.length > 0 ? prevSubs[prevSubs.length - 1].SubCategory.trim() || "" : "";
        setActiveSubCategory(lastSub);
      }
    }
  };

  /* const renderField = (field: Field) => {
    const { RowId, Name, IEFType, Lov, Value, Value2, Size, nDecimal } = field;
const lovOptions = Lov
  ? Lov.split(",").map((s) => s.trim()).filter((s) => s !== "")
  : [];
    if (IEFType === "H") return null;
    if (IEFType === "D") {
      return <div key={RowId} className="mb-4"><label className="block text-sm font-normal mb-1">{Name}</label><input type="date" value={Value} onChange={(e) => handleValueChange(RowId, e.target.value)} className="border px-3 py-2 w-full rounded" /></div>;
    }
    if (IEFType === "C") {
      return (
        <div key={RowId} className="mb-4">
          <label className="block text-sm font-normal mb-1">{Name}</label>
          {lovOptions.length > 0 ? (
            <select value={Value} onChange={(e) => handleValueChange(RowId, e.target.value)} className="border px-3 py-2 w-full rounded">
              <option value="">Select</option>
              {lovOptions.map((option, i) => <option key={i} value={option}>{option}</option>)}
            </select>
          ) : (
            <input type="text" value={Value} onChange={(e) => handleValueChange(RowId, e.target.value)} maxLength={Size} className="border px-3 py-2 w-full rounded" />
          )}
        </div>
      );
    }
    if (IEFType === "N") {
  //const step = nDecimal > 0 ? `0.${"0".repeat(nDecimal - 1)}1` : "1";
  return (
    <div key={RowId} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <label className="text-sm font-normal">{Name}</label>
      <input
  type="number"
  value={(Value === "" || Value === 0)? "" : Value}
  onChange={(e) =>
    handleValueChange(RowId, (e.target.value === "" )? "" : parseFloat(e.target.value))
  }
  placeholder={nDecimal > 0 ? "0.00" : "0"}
  step={nDecimal > 0 ? `0.${"0".repeat(nDecimal - 1)}1` : "1"}
  className="border rounded px-2 py-1 text-sm w-full"
/>

      <select
        value={Value2}
        onChange={(e) => handleFrequencyChange(RowId, e.target.value)}
        className="border px-3 py-2 w-full rounded"
      >
        <option value="">Select</option>
        {frequencyOptions.map((freq) => (
          <option key={freq}>{freq}</option>
        ))}
      </select>
    </div>
  );
}
return null;

  }; */

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-48 w-full bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categoryList.map((cat) => (
          <div key={cat} className={`p-2 mb-2 cursor-pointer rounded-lg transition hover:bg-blue-100  ${activeCategory === cat ? "bg-blue-200 font-bold" : ""}`} onClick={() => {
            setActiveCategory(cat);
            const subcats = fields.filter((f) => f.Category.trim() === cat).map((f) => f.SubCategory.trim()).filter((s) => s);
            setActiveSubCategory(subcats[0] || "");
          }}>
          
          
          <span className="inline-flex items-center">
              {icons[cat]}
              {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
            </span></div>
        ))}

        

      </div>
      
      <main className="flex-1 p-8 overflow-y-auto">

       

        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
  {/* Left: Subcategory buttons if they exist */}
  <div className="flex flex-wrap gap-3">
    {hasSubCategories &&
      subCategoryList.map((sub) => (
        <button
          key={sub}
          onClick={() => setActiveSubCategory(sub)}
          className={`px-2 py-2 rounded-full border  ${
            activeSubCategory === sub
              ? "bg-blue-500 text-white"
              : "bg-gray-300 hover:bg-gray-200 hover:font-bold"
          }`}
        >
          {sub}
        </button>
      ))}
  </div>

  {/* Right: Save & Review button always visible */}
  <div className="shrink-0">
    <button
      onClick={() => navigate("/reviewN")}
      className="px-4 py-2 rounded-full border transition bg-blue-500 text-white hover:bg-blue-200 hover:text-gray-700  hover:font-bold">
    
      Review
    </button>
  </div>
</div>

 <div className="bg-white p-6 shadow rounded-lg">
      {/* <h3 className="text-2xl font-semibold mb-4">
            Salary
          </h3> */}
          <form className="space-y-4">
       
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
  <table className="w-full table-fixed border-separate border-spacing-y-2">
    <thead className="text-left font-semibold text-gray-700">
  <tr>
    <th className="px-4 py-2 w-1/3">Name</th>
    <th className="px-4 py-2 w-1/3">Value</th>
    <th className="px-4 py-2 w-1/3">Frequency</th>
  </tr>
</thead>

    <tbody>
      {filteredFields.map((field) => {
        const { RowId, Name, IEFType, Value, Value2, Size, nDecimal, Lov } = field;
       // const step = nDecimal > 0 ? `0. £{"0".repeat(nDecimal - 1)}1` : "1";

        const renderInput = () => {
  switch (IEFType) {
    case "N":
  //const step = nDecimal > 0 ? `0.${"0".repeat(nDecimal - 1)}1` : "1";
  return (
    <input
  type="number"
  value={(Value === "" || Value === 0 )? "" : Value}
  onChange={(e) =>
    handleValueChange(RowId, e.target.value === "" ? "" : parseFloat(e.target.value))
  }
  placeholder={nDecimal > 0 ? "0.00" : "0"}
  step={nDecimal > 0 ? `0.${"0".repeat(nDecimal - 1)}1` : "1"}
  className="border rounded px-2 py-1 text-sm w-full"
/>

  );

    case "C":
      const isDropdown = Lov?.split(",").some((s) => s.trim());
      const lovOptions = isDropdown
        ? Lov.split(",").map((s) => s.trim()).filter((s) => s !== "")
        : [];

      return isDropdown && lovOptions.length > 0 ? (
        <select
          value={Value}
          onChange={(e) => handleValueChange(RowId, e.target.value)}
          className="border rounded px-2 py-1 text-sm w-full"
        >
          <option value="">Select</option>
          {lovOptions.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={Value}
          onChange={(e) => handleValueChange(RowId, e.target.value)}
          maxLength={Size}
          className="border rounded px-2 py-1 text-sm w-full"
        />
      );

    case "D":
  const parsedDate = Value ? new Date(Value) : null;
  return (
    <DatePicker
      selected={parsedDate}
      onChange={(date: Date | null) =>
        handleValueChange(RowId, date ? date.toISOString() : "")
      }
      dateFormat="MM-dd-yyyy"
      placeholderText="MM-DD-YYYY"
      className="border rounded px-2 py-1 text-sm w-full"
    />
  );


    default:
      return null;
  }
};


        return (
          <tr key={RowId} className="bg-white shadow rounded">
  <td className="px-2 py-1 w-1/3 whitespace-nowrap">{Name}</td>
  <td className="px-2 py-1 w-1/3">{renderInput()}</td>
  <td className="px-2 py-1 w-1/3">
    {IEFType === "N" ? (
      <select
        value={Value2}
        onChange={(e) => handleFrequencyChange(RowId, e.target.value)}
        className="border rounded px-2 py-1 text-sm w-full"
      >
        <option value="">Select</option>
        {frequencyOptions.map((freq) => (
          <option key={freq}>{freq}</option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value="NA"
        disabled
        className="border rounded px-2 py-1 text-sm w-full text-gray-500 bg-gray-100"
      />
    )}
  </td>
</tr>

        );
      })}
    </tbody>
  </table>
</div>

          <div className="font-semibold mt-6 text-right text-lg">
            Total:  £{total.toFixed(2)}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button onClick={handlePrevious} type="button" className="px-4 py-2 bg-gray-100 text-black hover:font-semibold hover:text-white rounded shadow hover:bg-blue-500">Previous</button>
            <button onClick={handleClear} type="button" className="px-4 py-2 bg-gray-300 text-black hover:font-semibold hover:text-white rounded shadow hover:bg-black">Clear</button>
            {isLastCategory && isLastSubCategory ? (
            <button onClick={() => navigate("/reviewN")} type="button" className="px-4 py-2 bg-gray-100 text-black hover:font-semibold hover:text-white rounded shadow hover:bg-blue-500">Next</button>
             ) : (
               <button onClick={handleNext} type="button" className="px-4 py-2 bg-gray-100 text-black hover:font-semibold hover:text-white rounded shadow hover:bg-blue-500">Next</button> 
             )}
          </div>
          </form>
        </div>

        
      </main>
      
    </div>
    
  );
  
};

export default App;
