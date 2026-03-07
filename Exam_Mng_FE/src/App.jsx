import React from 'react'
import CourseMaster from './Pages/CourseMaster';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Navbar from './Components/Navbar';
import Department from './Pages/Departrment';
import Semester from './pages/Semester';
import Subject_Master from "./pages/Subject_Master";
import Subject_Sem_Mapping from "./pages/Subject_Sem_Mapping";
import Result from './pages/Result';
import Temp from './Pages/Temp';
import { StudentMaster } from './Pages/StudentMaster';
import ExamMaster from './pages/ExamMaster';
import RegisterUser from './pages/RegistersUser';
import Login from "./pages/Login";
function Layout() {

  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div style={{ marginTop: "70px" }}>
        <Routes>

          <Route path="/" element={<RegisterUser />} />
          <Route path="/login" element={<Login />} />

          <Route path="/CourseMaster" element={<CourseMaster />} />
          <Route path="/SemesterMaster" element={<Semester />} />
          <Route path="/Subject" element={<Subject_Master />} />
          <Route path="/mapping" element={<Subject_Sem_Mapping />} />
          <Route path="/SubSemMapping" element={<Subject_Sem_Mapping />} />
          <Route path="/ResultMaster" element={<Result />} />
          <Route path="/temp" element={<Temp />} />
          <Route path="/dept" element={<Department />} />
          <Route path="/studentmaster" element={<StudentMaster />} />
          <Route path="/Exam" element={<ExamMaster />} />

        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
     <Layout/>
    </BrowserRouter>
  )
}

export default App;
