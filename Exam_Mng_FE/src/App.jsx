import React from 'react'
import CourseMaster from './Pages/CourseMaster';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
import Department from './Pages/Departrment';
import Subject_Master from "./Pages/Subject_Master";
import Subject_Sem_Mapping from "./Pages/Subject_Sem_Mapping";
import Course_Sem_Mapping from './Pages/Course_Sem_Mapping';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ✅ ADD THIS LINE */}
        <Route path="/" element={<Course_Sem_Mapping />} />

        <Route path="/CourseMaster" element={<CourseMaster />} />
        <Route path="/Subject" element={<Subject_Master />} />
        <Route path="/mapping" element={<Subject_Sem_Mapping />} />
        <Route path="/dept" element={<Department />} />
        <Route path="/CourseSem" element={<Course_Sem_Mapping />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App;