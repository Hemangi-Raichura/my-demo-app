import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormData } from "./context/FormDataContext";
import { FaMoneyBillWave, FaShoppingCart, FaRegCreditCard } from "react-icons/fa";

const icons: Record<string, JSX.Element> = {
  Income: <FaMoneyBillWave className="inline-block mr-2" />,
  Expenses: <FaShoppingCart className="inline-block mr-2" />,
  Debt: <FaRegCreditCard className="inline-block mr-2" />,
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, setFormData } = useFormData();

  const [menu, setMenu] = useState<Record<string, string[]>>({});
  const [apiData, setApiData] = useState<Record<string, any[]>>({});
  const [activeMain, setActiveMain] = useState<string>("Income");
  const [activeSub, setActiveSub] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [persistedRestoredData, setPersistedRestoredData] = useState<Record<string, Row[]> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRestored, setHasRestored] = useState(false); // 🆕 Prevent double restore
  const [restoredSubs, setRestoredSubs] = useState<Set<string>>(new Set());


  type Row = {
    label: string;
    value: number;
    frequency: {
      options: string[];
      frvalue: string;
    };
  };

  // 🔁 Load menu and apiData once
  useEffect(() => {
    async function load() {
      try {
        const [mRes, aRes] = await Promise.all([
          fetch("/menuData.json"),
          fetch("/apiData.json"),
        ]);
        const mJson = await mRes.json();
        const aJson = await aRes.json();

        console.log("✅ Menu JSON:", mJson);
        console.log("✅ API Data JSON:", aJson);
        setMenu(mJson);
        setApiData(aJson);
      } catch (e) {
        console.error("❌ Failed loading JSON:", e);
      }
    }
    load();
  }, []);

  // 🧠 Restore state from location.state after menu/apiData is ready
  useEffect(() => {
    if (
      isInitialized ||
      !Object.keys(menu).length ||
      !Object.keys(apiData).length
    ) return;

    const restored = location.state?.restoredData;
    const fromMain = location.state?.scrollToMain;
    const fromSub = location.state?.scrollToSub;

    const defaultMain = Object.keys(menu)[0];
    const mainKey = fromMain && menu[fromMain] ? fromMain : defaultMain;

    const subKey =
      fromSub && apiData[fromSub]
        ? fromSub
        : restored && typeof restored === "object"
          ? Object.keys(restored)[0]
          : menu[mainKey]?.[0] || "";

    setActiveMain(mainKey);
    setActiveSub(subKey);
    setPersistedRestoredData(restored || null);
    setIsInitialized(true);

    console.log("🚀 Initialized with:", mainKey, subKey);
  }, [menu, apiData, isInitialized, location.state]);

  // ✅ Clean up location.state ONCE after initialization
  useEffect(() => {
    if (isInitialized && location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [isInitialized, location.state, navigate, location.pathname]);

  // 🔁 Load rows when activeSub changes
  // 🔁 Load rows when activeSub changes
useEffect(() => {

  if (!activeSub || !apiData[activeSub]) return;

  const normalizeRow = (row: any): Row => {
    const frequency = row.frequency ?? {};
    const options = Array.isArray(frequency.options)
      ? frequency.options
      : ["Weekly", "Monthly"];
    const rawFrvalue = frequency.frvalue;
    const frvalue =
      typeof rawFrvalue === "string" &&
      options.includes(rawFrvalue)
        ? rawFrvalue
        : "";
    return {
      label: typeof row.label === "string" ? row.label : "Unnamed",
      value: typeof row.value === "number" ? row.value : 0,
      frequency: { options, frvalue },
    };
  };

  const expected = apiData[activeSub].map(normalizeRow);
  let initialRows: Row[] = [];

  // ✅ Skip restoration if already restored once
  if (restoredSubs.has(activeSub)) {
    console.log(`🔁 Already restored ${activeSub}, skipping overwrite`);
    return;
  }

  if (formData[activeSub]) {
    initialRows = formData[activeSub];
    console.log("✅ Loaded from context");
  } else if (persistedRestoredData?.[activeSub]) {
    initialRows = persistedRestoredData[activeSub].map(normalizeRow);
    console.log("✅ Loaded from restoredData");
  } else {
    const saved = localStorage.getItem(activeSub);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === expected.length
        ) {
          initialRows = parsed;
          console.log("✅ Loaded from localStorage");
        }
      } catch {
        console.warn("❌ Parse error on localStorage data");
      }
    }

    if (!initialRows.length) {
      initialRows = expected;
      console.log("ℹ️ Fallback to API data");
    }
  }

  // ✅ Save and mark as restored
  setRows(initialRows);
  setRestoredSubs((prev) => new Set(prev).add(activeSub));
}, [activeSub, apiData, formData, persistedRestoredData, restoredSubs]);


  // 💾 Save rows to localStorage when changed
  useEffect(() => {
    if (activeSub) {
      localStorage.setItem(activeSub, JSON.stringify(rows));
    }
  }, [rows, activeSub]);

  // Navigation helper logic
  const mainKeys = Object.keys(menu);
  const isAtStart = activeMain === mainKeys[0] && activeSub === menu[activeMain]?.[0];

  function handlePrevious() {
    const subs = menu[activeMain] || [];
    const mIdx = mainKeys.indexOf(activeMain);
    const sIdx = subs.indexOf(activeSub);
    if (sIdx > 0) {
      setActiveSub(subs[sIdx - 1]);
    } else if (mIdx > 0) {
      const prevMain = mainKeys[mIdx - 1];
      const lastSub = menu[prevMain]?.slice(-1)[0] || "";
      setActiveMain(prevMain);
      setActiveSub(lastSub);
    }
  }

  function handleNext() {
    localStorage.setItem(activeSub, JSON.stringify(rows));
    setFormData((prev) => ({ ...prev, [activeSub]: rows }));

    const subs = menu[activeMain] || [];
    const mIdx = mainKeys.indexOf(activeMain);
    const sIdx = subs.indexOf(activeSub);

    if (sIdx + 1 < subs.length) {
      setActiveSub(subs[sIdx + 1]);
    } else if (mIdx + 1 < mainKeys.length) {
      const nextMain = mainKeys[mIdx + 1];
      setActiveMain(nextMain);
      setActiveSub(menu[nextMain]?.[0] || "");
    } else {
      navigate("/review", { state: { scrollToSection: activeMain } });
    }
  }

  // 💯 Calculate progress
  const totalRows = rows.length;
  const filledRows = rows.filter((row) => row.value && row.value !== "").length;
  const progressPercentage = totalRows > 0 ? (filledRows / totalRows) * 100 : 0;
  const total = rows.reduce((sum, row) => sum + parseFloat(row.value || "0"), 0);

  const clearForm = () => {
  const cleared = rows.map((row) => ({
    ...row,
    value: 0,
    frequency: {
      ...row.frequency,
      frvalue: "", // 🔄 Reset to "Select"
    },
  }));
  setRows(cleared);
  setRestoredSubs((prev) => {
  const updated = new Set(prev);
  updated.add(activeSub);
  return updated;
});
  localStorage.setItem(activeSub, JSON.stringify(cleared));
  setFormData((prev) => ({ ...prev, [activeSub]: cleared }));
};


  // ⏳ Loading guard
  if (!Object.keys(menu).length || !Object.keys(apiData).length) {
    return <div className="p-10 text-xl">Loading form…</div>;
  }



  return (
          <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:w-48 w-full bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {Object.keys(menu).map((item) => (
          <div
            key={item}
            className={`p-2 mb-2 cursor-pointer rounded-lg transition hover:bg-blue-100 ${
              activeMain === item ? "bg-blue-200 font-bold" : ""
            }`}
            onClick={() => {
              setActiveMain(item);
              setActiveSub(menu[item][0]);
            }}
          >
            <span className="inline-flex items-center">
              {icons[item]}
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Progress */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Completion Progress: {progressPercentage}%
          </label>
          <div className="w-full bg-gray-300 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {(menu[activeMain] || []).map((subItem) => (
            <button
              key={subItem}
              onClick={() => setActiveSub(subItem)}
              className={`px-4 py-2 rounded-full border transition ${
                activeSub === subItem
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              {subItem}
            </button>
          ))}

          <div className="ml-auto"></div>
          <button
            onClick={() => navigate("/review")}
            className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-blue-600"
  >
       Review
       </button>
       
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg p-6 max-w-4x overflow-x-auto">
          <h3 className="text-2xl font-semibold mb-4">
            {activeMain} - {activeSub}
          </h3>
          <form className="space-y-4">
            {/* Sticky Header */}
            <div className="grid grid-cols-3 gap-4 items-center font-semibold text-gray-600 border-b pb-2 sticky top-0 bg-white z-10">
              <span>Name</span>
              <span>Value</span>
              <span>Frequency</span>
            </div>
            {rows.length === 0 ? (
              <p className="text-gray-500 mt-4">
                No data available for this category.
              </p>
            ) : (
              rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <label>{row.label}</label>
                  <input
  type="number"
  step="0.01"
  min="0"
  className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="0" // 👈 shows 0 as hint
  value={row.value === 0 ? "" : row.value} // 👈 hide 0 until typed
  onChange={(e) => {
    const val = e.target.value;
    const newRows = [...rows];
    newRows[index].value = val === "" ? 0 : parseFloat(val);
    setRows(newRows);
  }}
/>

                  <select
  value={row.frequency.frvalue}
  onChange={(e) => {
    const newRows = [...rows];
    newRows[index].frequency.frvalue = e.target.value;
    setRows(newRows);
  }}
  className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="" disabled>
    Select 
  </option>
  {row.frequency.options.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ))}
</select>


                </div>
              ))
            )}

            <div className="flex justify-between items-center mt-6">
              <div className="text-lg font-medium">
                Total: ${total.toFixed(2)}
              </div>
              <div className="flex gap-4">
                
                
            <button
                  type="button"
                  className="text-blue-600 px-4 py-2 border rounded hover:bg-gray-300 transition"
                  onClick={handlePrevious}  disabled={isAtStart}>Previous</button>        

            <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                >
                  Clear
                </button>

            <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={handleNext}>Next</button>
    
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    

  );
}
