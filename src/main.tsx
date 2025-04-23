import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReviewPage from "./review.tsx";
import { FormDataProvider } from "./context/formDataContext.tsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
   //<React.StrictMode>
     //<App />
   //</React.StrictMode>,
  
  <React.StrictMode>
    <FormDataProvider>
  <BrowserRouter>
    <Routes>
     <Route path="/" element={<App />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  </BrowserRouter>
  </FormDataProvider>
  </React.StrictMode>,

);
