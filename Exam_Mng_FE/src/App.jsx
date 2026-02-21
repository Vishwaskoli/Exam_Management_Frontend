import React from 'react'
import CourseMaster from './pages/CourseMaster';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
import Department from './Pages/Departrment';
import Semester from './pages/Semester';
// import Temp from './Pages/Temp';
import Subject_Master from "./pages/Subject_Master";
import Subject_Sem_Mapping from "./pages/Subject_Sem_Mapping";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/CourseMaster" element={<CourseMaster />} />
        <Route path="/SemesterMaster" element={<Semester />} />
        <Route path="/Subject" element={<Subject_Master />} />
        <Route path="/mapping" element={<Subject_Sem_Mapping />} />
        {/* <Route path="/temp" element={<Temp />} /> */}
        <Route path="/dept" element={<Department/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
