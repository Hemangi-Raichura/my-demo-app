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
  Test2: <FaClipboardCheck  className="inline-block mr-2" />,
  Default: <FaWallet className="inline-block mr-2"/>
};

const frequencyOptions = ["Weekly", "Monthly", "Quarterly", "Annually"];

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const [frozenMap, setFrozenMap] = useState<Record<number, boolean>>({});


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
    const API_BASE = "https://apirepo-0bkw.onrender.com";

    fetch(`${API_BASE}/formdata`)
      .then((res) => res.json())
      .then((data) => {
        if (data.fields) {
          const initialized = data.fields.map((field: Field) => ({
            ...field,
            Value: field.Value ?? (field.IEFType === "N" ? 0 : ""),
            Frequency: field.Frequency ?? "",
          }));
          setFields(initialized);
          const firstCat = fromCategory || initialized.find((f: Field) => f.Category.trim())?.Category.trim() || "";
          setActiveCategory(firstCat);
          const firstSub = initialized.find((f: Field) => f.Category.trim() === firstCat && f.SubCategory.trim())?.SubCategory.trim() || "";
          setActiveSubCategory(firstSub);
        }
      });
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
  const reset = fields.map((f) => {
    const matchCategory = f.Category.trim() === activeCategory.trim();
    const matchSub = activeSubCategory.trim() === "" || f.SubCategory.trim() === activeSubCategory.trim();

    if (matchCategory && matchSub) {
      return {
        ...f,
        Value: "",
        Value2: "",
      };
    }
    return f;
  });

  setFields(reset);
  localStorage.setItem("webformData", JSON.stringify(reset));
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

 
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-48 w-full bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categoryList.map((cat) => (
          <div key={cat} className={`p-2 mb-2 cursor-pointer rounded-lg transition hover:bg-blue-100  ${activeCategory === cat ? "bg-blue-200 font-semibold" : ""}`} onClick={() => {
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
      
      <main className="flex-1 p-6 overflow-y-auto">

       

        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
  {/* Left: Subcategory buttons if they exist */}
  <div className="flex flex-wrap gap-3">
    {hasSubCategories &&
      subCategoryList.map((sub) => (
        <button
          key={sub}
          onClick={() => setActiveSubCategory(sub)}
          className={`px-4 py-2 rounded-full border transition hover:bg-blue-200 hover:text-black ${
            activeSubCategory === sub
              ? "bg-blue-500 text-white"
              : "bg-white "
          }`}
        >
          {sub}
        </button>
      ))}
  </div>

  {/* Right: Save & Review button always visible */}
  <div className="ml-auto">
    <button
      onClick={() => navigate("/reviewN")}
      className="px-4 py-2 rounded-full border transition bg-blue-500 text-white hover:bg-blue-200 hover:text-gray-700">
    
      Review
    </button>
  </div>
</div>

 <div className="bg-white p-6 shadow rounded-lg  p-6 max-w-4x overflow-x-auto ">
	
<form className="space-y-2 flex flex-col h-full" >
  {/* Sticky Header */}
  <div className="grid grid-cols-3 gap-4 items-center font-semibold text-gray-600 border-b pb-2 sticky top-0 bg-white z-10">
    <span>Name</span>
    <span>Value</span>
    <span>Frequency</span>
  </div>

       {/* Scrollable field rows */}
  <div className="space-y-2 p-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>

    
  {filteredFields.length === 0 ? (
    <p className="text-gray-500 mt-4">No data available for this category.</p>
  ) : (
    filteredFields.map((field) => {
      const { RowId, Name, IEFType, Value, Value2, Size, nDecimal, Lov } = field;

      const renderInput = () => {
        switch (IEFType) {
          case "N":
            return (
              <input
                type="text"
                inputMode="decimal"
                value={Value === "" || Value === "0" || Value === 0 ? "" : Value}

                onChange={(e) => {
                  const input = e.target.value;
                  if (input === "") {
                    setFrozenMap((prev) => ({ ...prev, [RowId]: false }));
                    handleValueChange(RowId, "");
                    return;
                  }
                  // Reject if input contains any non-numeric characters (excluding . for decimals)
                  if (!/^\d*\.?\d*$/.test(input)) return;

                  if (nDecimal === 0 && input.includes(".")) {
                    setFrozenMap((prev) => ({ ...prev, [RowId]: true }));
                    return;
                  }
                  if (nDecimal > 0) {
                    const decimalRegex = new RegExp(`^\\d*(\\.\\d{0,${nDecimal}})?$`);
                    if (!decimalRegex.test(input)) return;
                  }
                  if (nDecimal === 0 && /^\d*$/.test(input)) {
                    handleValueChange(RowId, input);
                    return;
                  }
                  handleValueChange(RowId, input);
                }}
                onKeyDown={(e) => {
                  const isFrozen = frozenMap[RowId] || false;
                  if (isFrozen && !["Backspace", "Delete"].includes(e.key)) {
                    e.preventDefault();
                  }
                  if (["Backspace", "Delete"].includes(e.key)) {
                    const valAfter = Value.slice(0, -1);
                    if (!valAfter.includes(".")) {
                      setFrozenMap((prev) => ({ ...prev, [RowId]: false }));
                    }
                  }
                }}
                placeholder={nDecimal === 0 ? "Whole number only" : `e.g. 0.${"0".repeat(nDecimal)}`}
                className={`border rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 ${frozenMap[RowId] ? "border-red-500 bg-red-100 placeholder:text-red-500" : "border-gray-300"}`}
              />
            );

          case "C":
            const isDropdown = Lov?.split(",").some((s) => s.trim());
            const lovOptions = isDropdown ? Lov.split(",").map((s) => s.trim()).filter((s) => s !== "") : [];
            return isDropdown && lovOptions.length > 0 ? (
              <select
                value={Value}
                onChange={(e) => handleValueChange(RowId, e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
              />
            );

          default:
            return null;
        }
      };

      return (
        <div key={RowId} className="grid grid-cols-3 gap-4 items-center">
          <label>{Name}</label>
          {renderInput()}
          <div>
            {IEFType === "N" ? (
              <select
                value={Value2}
                onChange={(e) => handleFrequencyChange(RowId, e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
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
                className="border border-gray-300 rounded-md px-2 py-1 text-gray-500 bg-gray-100 w-full"
              />
            )}
          </div>
        </div>
      );
    })
  )}
</div>

 {/* Sticky Footer */}
  <div className="flex justify-between items-center mt-6 sticky bottom-0 bg-white py-2 z-10">
   
  
    <div className="text-lg font-medium">
      Total: £{total.toFixed(2)}
    </div>
    <div className="flex gap-4">
      <button
        type="button"
        onClick={handlePrevious}
        className="bg-white text-blue px-4 py-2 border border-blue-500 rounded-md hover:bg-blue-200 hover:text-black transition"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
      >
        Clear
      </button>
      {isLastCategory && isLastSubCategory ? (

      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-200 hover:text-black transition"
        onClick={() => navigate("/reviewN")}
      >
        Next
      </button>) : (
        <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-200 hover:text-black transition"
        onClick={handleNext}
      >
        Next
      </button>
      )}
    </div>
    </div>
  
</form>

        </div>

        
      </main>
      
    </div>
    
  );
  
};

export default App;