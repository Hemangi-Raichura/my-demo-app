import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormDataProvider } from './context/FormDataContext'; // adjust path if needed
import { useFormData } from './context/FormDataContext';
import { useLocation } from "react-router-dom";



import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaRegCreditCard,
} from "react-icons/fa";

const menu = {
  Income: ["Salary", "Freelance", "Other Income"],
  Expenses: ["Housing", "Utilities", "Food", "Transport"],
  Debt: ["Credit Card", "Loans", "EMI"],
};

const apiData = {
  Salary: [
    { label: "Base Salary", value: "", frequency: "Monthly" },
    { label: "Performance Bonus", value: "", frequency: "" },
  ],
  Freelance: [
    { label: "Website Development", value: "", frequency: "Weekly" },
    { label: "Content Writing", value: "", frequency: "Monthly" },
  ],
  "Other Income": [
    { label: "Rental Income", value: "", frequency: "Monthly" },
    { label: "Dividends", value: "", frequency: "" },
  ],
  Housing: [
    { label: "Rent", value: "", frequency: "Monthly" },
    { label: "Maintenance", value: "", frequency: "" },
  ],
  Utilities: [
    { label: "Electricity", value: "", frequency: "Monthly" },
    { label: "Water Bill", value: "", frequency: "Monthly" },
    { label: "Internet", value: "", frequency: "Monthly" },
  ],
  Food: [
    { label: "Groceries", value: "", frequency: "Weekly" },
    { label: "Dining Out", value: "", frequency: "Weekly" },
  ],
  Transport: [
    { label: "Fuel", value: "", frequency: "Weekly" },
    { label: "Public Transport", value: "", frequency: "Monthly" },
  ],
  "Credit Card": [
    { label: "Bank Card 1", value: "", frequency: "Monthly" },
    { label: "Bank Card 2", value: "", frequency: "Monthly" },
  ],
  Loans: [
    { label: "Student Loan", value: "", frequency: "Monthly" },
    { label: "Car Loan", value: "", frequency: "Monthly" },
  ],
  EMI: [
    { label: "Mobile Phone EMI", value: "", frequency: "Monthly" },
    { label: "Appliance EMI", value: "", frequency: "Monthly" },
  ],
};

const icons = {
  Income: <FaMoneyBillWave className="inline-block mr-2" />,
  Expenses: <FaShoppingCart className="inline-block mr-2" />,
  Debt: <FaRegCreditCard className="inline-block mr-2" />,
};

export default function App() {
  const navigate = useNavigate();
  const { formData, setFormData } = useFormData();  // Access formData and setFormData from context
  const location = useLocation();
  const scrollToMain = location.state?.scrollToMain;
  const scrollToSub = location.state?.scrollToSub;

useEffect(() => {
  const scrollToMain = location.state?.scrollToMain;

  if (scrollToMain && menu[scrollToMain]?.length > 0) {
    setActiveMain(scrollToMain);
    setActiveSub(menu[scrollToMain][0]); // Set first subcategory
  }
}, [scrollToMain]);


useEffect(() => {
  if (location.state) {
    navigate(location.pathname, { replace: true, state: null });
  }
}, []);

const [activeMain, setActiveMain] = useState(() =>
  scrollToMain && menu[scrollToMain]?.includes(scrollToSub)
    ? scrollToMain
    : "Income"
);

const [activeSub, setActiveSub] = useState(() =>
  scrollToMain && menu[scrollToMain]?.includes(scrollToSub)
    ? scrollToSub
    : menu["Income"][0]
);

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem(menu["Income"][0]);
    return saved ? JSON.parse(saved) : apiData[menu["Income"][0]];
  });

  // useEffect(() => {
  //   if (menu[activeMain]?.length > 0){
  //   setActiveSub(menu[activeMain][0]);}
  // }, [activeMain]);

  useEffect(() => {
  if (scrollToMain && menu[scrollToMain]?.includes(scrollToSub)) {
    setActiveMain(scrollToMain);
    setActiveSub(scrollToSub);
  }

navigate(location.pathname, { replace: true, state: null });

}, [scrollToMain, scrollToSub]);

  useEffect(() => {
    const saved = localStorage.getItem(activeSub);
      const contextSaved = formData[activeSub];


    setRows(
      saved
        ? JSON.parse(saved)
        : contextSaved
        ? contextSaved
        : apiData[activeSub]
        ? [...apiData[activeSub]]
        : []
    );
  }, [activeSub]);

  useEffect(() => {
    localStorage.setItem(activeSub, JSON.stringify(rows));
  }, [rows, activeSub]);

  const isAtStart = activeMain === Object.keys(menu)[0] && activeSub === menu[activeMain][0];

  const handlePrevious = () => {

  const mainMenuKeys = Object.keys(menu);
  const currentMainIndex = mainMenuKeys.indexOf(activeMain);
  const subMenus = menu[activeMain];
  const currentSubIndex = subMenus.indexOf(activeSub);


  if (currentSubIndex > 0) {
    // ✅ Go to previous submenu
    setActiveSub(subMenus[currentSubIndex - 1]);
  } else if (currentMainIndex > 0) {
    // ✅ Go to last submenu of previous main menu
    const previousMain = mainMenuKeys[currentMainIndex - 1];
    const previousSubMenus = menu[previousMain];
    const lastSubmenu = previousSubMenus[previousSubMenus.length - 1];

    setActiveMain(previousMain);
    setActiveSub(lastSubmenu);
  } else {
    // ✅ Already at first menu & submenu
    console.log("You're already at the beginning.");
  }
};


  const handleNext = () => {
  const subMenus = menu[activeMain];
  const mainMenuKeys = Object.keys(menu);

  const currentMainIndex = mainMenuKeys.indexOf(activeMain);
  const currentSubIndex = subMenus.indexOf(activeSub);
  const nextSubIndex = currentSubIndex + 1;

  setFormData((prev: any) => ({
    ...prev,
    [activeSub]: rows,
  }));

  // ✅ Case 1: Move to next submenu within same main menu
  if (nextSubIndex < subMenus.length) {
    setActiveSub(subMenus[nextSubIndex]);
  } 
  // ✅ Case 2: Move to first submenu of next main menu
  else if (currentMainIndex < mainMenuKeys.length - 1) {
    const nextMain = mainMenuKeys[currentMainIndex + 1];
    const nextSub = menu[nextMain][0];

    setActiveMain(nextMain);
    setActiveSub(nextSub); // ✅ Set both together — no need to rely on useEffect
  } 
  // ✅ Case 3: End of all menus, go to review page
  else {

    navigate("/review", {
      state: { scrollToSection: activeMain },
    });
  }


   /*  return (
     <FormDataProvider> 
    <div>
      <h2>Active Main Menu: {activeMain}</h2>
      <h3>Active Sub Menu: {activeSub}</h3> 
      <button onClick={handleNext}>Next</button>
    </div>
    </FormDataProvider>
  ); */
  };

      

//const mainMenuKeys = Object.keys(menu); // ["Income", "Expenses", "Savings"]
//const activeMainIndex = mainMenuKeys.indexOf(activeMain);
//console.log(menu[activeMain].length); // e.g., 0 if activeMain is "Income"


  const filledCount = rows.filter((row) => row.value !== "").length;
  const progressPercentage = rows.length
    ? Math.round((filledCount / rows.length) * 100)
    : 0;

  const total = rows.reduce(
    (acc, curr) => acc + parseFloat(curr.value || 0),
    0
  );

  const clearForm = () => {
    const cleared = rows.map((row) => ({
      ...row,
      value: "",
      frequency: row.frequency || "Monthly",
    }));
    setRows(cleared);
    localStorage.setItem(activeSub, JSON.stringify(cleared));
  };

  return (
    <FormDataProvider>
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
          {menu[activeMain].map((subItem) => (
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
                    className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="$0.00"
                    value={row.value}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[index].value = e.target.value;
                      setRows(newRows);
                    }}
                  />
                  <select
                    value={row.frequency || "Monthly"}
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[index].frequency = e.target.value;
                      setRows(newRows);
                    }}
                    className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
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
    </FormDataProvider>

  );
}
