import React from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosConfig";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

const handleLogout = async () => {

  await api.post("/User/logout");

  localStorage.removeItem("token");
navigate("/login");
};
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        <div className="p-5 border-b font-semibold text-lg">Menu</div>

        <ul className="navbar-nav d-flex flex-column ms-4 align-items-start flex-grow-1 pe-3">

          {/* Masters Dropdown */}
          <li className="nav-item dropdown">
            <span
              className="nav-link dropdown-toggle cursor-pointer"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Masters
            </span>

            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/faculty"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Faculty Master
                </Link>
              </li>

              <li>
                <Link
                  to="/coursemaster"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Course Master
                </Link>
              </li>

              <li>
                <Link
                  to="/subject"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Subject Master
                </Link>
              </li>

              <li>
                <Link
                  to="/semestermaster"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Semester Master
                </Link>
              </li>
              <li>
                <Link
                  to="/exam"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Exam Master
                </Link>
              </li>

              <li>
                <Link
                  to="/studentmaster"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Student Master
                </Link>
              </li>
             

              <li>
                <Link
                  to="/ResultMaster"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Result Master
                </Link>
              </li>
            </ul>
          </li>

          {/* Mapping Dropdown */}
          <li className="nav-item dropdown mt-2">
            <span
              className="nav-link dropdown-toggle cursor-pointer"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Mapping
            </span>

            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/SubSemMapping"
                  onClick={() => setIsOpen(false)}
                  className="dropdown-item"
                >
                  Subject-Sem Mapping
                </Link>
              </li>
            </ul>
          </li>

        </ul>
        <li className="nav-item mt-4">
  <button
    className="btn btn-danger ms-3"
    onClick={handleLogout}
  >
    Logout
  </button>
</li>
      </div>
      
    </>
  );
}; 

export default Sidebar;