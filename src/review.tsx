// 

import React, { useState, useEffect  } from 'react';
import { useFormData } from './context/FormDataContext';  // Import context
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';





export default function ReviewPage  () {  
    const { formData } = useFormData();  // Access form data from context
    const navigate = useNavigate(); // inside your component
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [collapsed, setCollapsed] = useState({});

    const [menu, setMenu] = useState({});
const [apiData, setApiData] = useState({});

// Fetch menu and apiData when component mounts
useEffect(() => {
  const fetchData = async () => {
    try {
      const menuResponse = await fetch('/menuData.json');
      const menuJson = await menuResponse.json();
      setMenu(menuJson);

      const apiResponse = await fetch('/apiData.json');
      const apiJson = await apiResponse.json();
      setApiData(apiJson);
    } catch (error) {
      console.error('Failed to load JSON data:', error);
    }
  };

  fetchData();
}, []);


  const getAllData = () => {
  const result: any = {};
  Object.keys(menu).forEach((mainCategory) => {
    result[mainCategory] = {};
    menu[mainCategory].forEach((sub: string) => {
      const saved = localStorage.getItem(sub);
      const defaultData = apiData[sub] || [];
      result[mainCategory][sub] = saved ? JSON.parse(saved) : defaultData;
    });
  });
  return result;
 };


  const allData = getAllData();

  const handleSubmitConfirmed = () => {

    setSubmitting(true);
    setShowConfirm(false);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Data successfully submitted to the API!', {
        position: 'top-right',
        autoClose: 8000,
      });

     // Clear localStorage after successful submission
      Object.values(menu).flat().forEach((category) => {
        localStorage.removeItem(category);
      });
     // Redirect to App Form after a small delay (same as toast display)
    setTimeout(() => {
      navigate('/'); 
    }, 2000); // short delay so user sees toast 
    }, 1500);
  };
  
  if (Object.keys(menu).length === 0 || Object.keys(apiData).length === 0) {
  return <div className="p-6 text-gray-700">Loading data...</div>;
 }
 
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Review Your Inputs</h2>

      {Object.entries(allData).map(([mainCategory, subCategories]) => {
        const categoryTotal = Object.values(subCategories).reduce(
          (acc, items) => acc + items.reduce((sum, row) => sum + parseFloat(row.value || 0), 0),
          0
        );

        const isCollapsed = collapsed[mainCategory];

        return (
          <div key={mainCategory} className="mb-10 border rounded-xl shadow-sm bg-white">
            <div className="flex justify-between items-center bg-blue-50 px-4 py-3 rounded-t-xl">
              <div className="text-xl font-semibold text-gray-800">
                {mainCategory} – Total: ${categoryTotal.toFixed(2)}
              </div>
              <div className="flex gap-2">

                <Link
                    to="/"
                    state={{ scrollToMain: mainCategory, scrollToSub: subCategories }}  // ✅ include both
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg"
                >   
                <Edit className="w-4 h-4" /> Edit
                </Link>

                <button
                  onClick={() => setCollapsed((prev) => ({ ...prev, [mainCategory]: !prev[mainCategory] }))}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      <th className="p-3">Sub-Category</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(subCategories).map(([subCategory, items]) => {
                      let subTotal = 0;
                      return (
                        <React.Fragment key={subCategory}>
                          {items.map((row, i) => {
                            const value = parseFloat(row.value || 0);
                            subTotal += value;
                            return (
                              <tr
                                key={`${subCategory}-${i}`}
                                className="hover:bg-gray-50 border-b"
                              >
                                <td className="p-3 align-top text-gray-600">{i === 0 ? subCategory : ''}</td>
                                <td className="p-3 text-gray-800">{row.label}</td>
                                <td className="p-3 text-right text-gray-700">${value.toFixed(2)}</td>
                                <td className="p-3 text-gray-500">{row.frequency || '—'}</td>
                              </tr>
                            );
                          })}
                          <tr className="font-semibold text-gray-800 bg-gray-100">
                            <td colSpan={2} className="p-3 text-right">Subtotal ({subCategory}):</td>
                            <td className="p-3 text-right">${subTotal.toFixed(2)}</td>
                            <td className="p-3">—</td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex justify-between items-center">
        <a
          href="/"
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Go Back
        </a>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className={`px-4 py-2 rounded text-white transition flex items-center gap-2 ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {submitting && <span className="loader ease-linear rounded-full border-2 border-t-2 border-white h-4 w-4"></span>}
          {submitting ? 'Submitting...' : 'Confirm & Submit'}
        </button>
      </div>

  {showConfirm && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full transform transition-all">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Submission</h3>
      <p className="mb-6 text-gray-600">
        Are you sure you want to submit all the entered data? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitConfirmed}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Yes, Submit
        </button>
      </div>
    </div>
  </div>
)}


      <style>{`
        .loader {
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


// ReviewPage.txt
// Displaying ReviewPage.txt.