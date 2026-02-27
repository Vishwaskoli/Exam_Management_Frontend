import React from 'react'
import CourseMaster from './Pages/CourseMaster';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
import Department from './Pages/Departrment';
import Semester from './pages/Semester';
// import Temp from './Pages/Temp';
import Subject_Master from "./pages/Subject_Master";
import Subject_Sem_Mapping from "./pages/Subject_Sem_Mapping";
import Temp from './Pages/Temp';
import { StudentMaster } from './Pages/StudentMaster';

function App() {
  return (
    <BrowserRouter>
    <Navbar />
        <div style={{marginTop:"100px"}} className=''>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/CourseMaster" element={<CourseMaster />} />
        <Route path="/SemesterMaster" element={<Semester />} />
        <Route path="/Subject" element={<Subject_Master />} />
        <Route path="/SubSemMapping" element={<Subject_Sem_Mapping />} />
        {/* <Route path="/temp" element={<Temp />} /> */}
        <Route path="/temp" element={<Temp />} />
        <Route path="/dept" element={<Department/>}/>
        <Route path="/studentmaster" element={<StudentMaster/>}/>
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
