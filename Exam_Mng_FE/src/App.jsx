import { Routes, Route, Link } from "react-router-dom";
import Subject_Master from "./pages/Subject_Master";
import Subject_Sem_Mapping from "./pages/Subject_Sem_Mapping";

function App() {
  return (
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
