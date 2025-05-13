import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App2.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReviewPage from "./reviewN.tsx";
import JsonInputPage from "./jsonInputPage.tsx";
import { FormDataProvider } from "./context/formDataContext.tsx";
import OutputJsonPage from "./jsonOutputPage.tsx";


import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
   //<React.StrictMode>
     //<App />
   //</React.StrictMode>,
  
  <React.StrictMode>
    <FormDataProvider>
  <BrowserRouter basename="/my-demo-app/">
    <Routes>
      <Route path="/jsonInputPage" element={<JsonInputPage />} />

      <Route path="/" element={<JsonInputPage />} />
     <Route path="/App2" element={<App />} /> 
      <Route path="/reviewN" element={<ReviewPage />} />
      <Route path="/jsonOutputPage" element={<OutputJsonPage />} />
    </Routes>
  </BrowserRouter>
  </FormDataProvider>
  </React.StrictMode>,

);
