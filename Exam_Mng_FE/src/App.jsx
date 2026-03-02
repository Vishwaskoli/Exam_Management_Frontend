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
// <<<<<<< HEAD
// <<<<<<< HEAD
import Result from './pages/Result';
// =======
import Temp from './Pages/Temp';
import { StudentMaster } from './Pages/StudentMaster';
// >>>>>>> origin/Vishwas
// =======
import ExamMaster from './pages/ExamMaster';
// >>>>>>> origin/Shreyash

function App() {
  return (
    <BrowserRouter>
{/* <<<<<<< HEAD */}
    {/* <Navbar /> */}
{/* // ======= */}
    <Navbar />
        <div style={{marginTop:"70px"}} className=''>
{/* >>>>>>> origin/Vishwas */}
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/CourseMaster" element={<CourseMaster />} />
        <Route path="/SemesterMaster" element={<Semester />} />
        <Route path="/Subject" element={<Subject_Master />} />
{/* <<<<<<< HEAD */}
        <Route path="/mapping" element={<Subject_Sem_Mapping />} />
        <Route path="/ResultMaster" element={<Result />} />
{/* ======= */}
        <Route path="/SubSemMapping" element={<Subject_Sem_Mapping />} />
{/* >>>>>>> origin/Vishwas */}
        {/* <Route path="/temp" element={<Temp />} /> */}
        <Route path="/temp" element={<Temp />} />
        <Route path="/dept" element={<Department/>}/>
{/* <<<<<<< HEAD */}
        <Route path="/studentmaster" element={<StudentMaster/>}/>
{/* ======= */}
        <Route path="/Exam" element={<ExamMaster />} />
        
{/* >>>>>>> origin/Shreyash */}
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
