import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App2.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReviewPage from "./reviewN.tsx";
//import JsonInputPage from "./jsonInputPage.tsx";
import { FormDataProvider } from "./context/FormDataContext.tsx";
//import OutputJsonPage from "./jsonOutputPage.tsx";
import { Navigate } from "react-router-dom";


import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
   
  <React.StrictMode>
    <FormDataProvider>
  <BrowserRouter basename="/my-demo-app">
    <Routes>
      
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/" element={<App />} />
       
      <Route path="/reviewN" element={<ReviewPage />} />
      
    </Routes>
  </BrowserRouter>
  </FormDataProvider>
  </React.StrictMode>,

);
