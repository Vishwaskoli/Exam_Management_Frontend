import React from 'react'
import CourseMaster from './Pages/CourseMaster'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
// import Temp from './Pages/Temp';


export default function App() {
import { Routes, Route, Link } from "react-router-dom";
import Subject_Master from "./pages/Subject_Master";
import Subject_Sem_Mapping from "./pages/Subject_Sem_Mapping";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/CourseMaster" element={<CourseMaster />} />
        {/* <Route path="/temp" element={<Temp />} /> */}
      </Routes>
    </BrowserRouter>
  )
    <div className="container mt-3">

      {/* Simple Navigation */}
      <div className="mb-4">
        <Link to="/" className="btn btn-primary me-2">
          Subject Master
        </Link>

        <Link to="/mapping" className="btn btn-success">
          Subject-Sem Mapping
        </Link>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Subject_Master />} />
        <Route path="/mapping" element={<Subject_Sem_Mapping />} />
      </Routes>

    </div>
  );
}

export default App;
