import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
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
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 z-50`}
      >
        <div className="p-5 border-b font-semibold text-lg">
          Menu
        </div>



{/* <<<<<<< HEAD */}
          <li>
            <Link
              to="/faculty"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
              Faculty Master
            </Link>
          </li>
          
{/* ======= */}
        <ul className="navbar-nav d-flex flex-column ms-4 align-items-start flex-grow-1 pe-3">
{/* >>>>>>> origin/Vishwas */}

          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Masters
            </a>
            <ul className="dropdown-menu dropdown-menu">
              <li>
                <Link
                  to="/coursemaster"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Course Master
                </Link>
              </li>
              <li>
            <Link
              to="/ResultMaster"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
            >
              Result Master
            </Link>
          </li>
              <li>
                <Link
                  to="/Subject"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Subject Master
                </Link>
              </li>
              <li>
                <Link
                  to="/semestermaster"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Semester Master
                </Link>
              </li>
              <li>
                <Link
                  to="/SubSemMapping"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Subject Semester Mapping
                </Link>
              </li>
              <li>
                <Link
                  to="/studentmaster"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded dropdown-item hover:bg-blue-100"
                >
                  Student Master
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
