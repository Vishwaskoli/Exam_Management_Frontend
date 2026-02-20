import React from 'react'
import CourseMaster from './Pages/CourseMaster'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
// import Temp from './Pages/Temp';


export default function App() {
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
}
