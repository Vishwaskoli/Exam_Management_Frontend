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
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        <div className="p-5 border-b font-semibold text-lg">
          Masters
        </div>

        <ul className="flex flex-col p-3 gap-3">
          <li>
            <Link
              to="/coursemaster"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
              Course Master
            </Link>
          </li>

          <li>
            <Link
              to="/students"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
              Student Master
            </Link>
          </li>

          <li>
            <Link
              to="/faculty"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
              Faculty Master
            </Link>
          </li>

          <li>
            <Link
              to="/subject"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
             Subject Master
            </Link>
          </li>

          <li>
            <Link
              to="/mapping"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded hover:bg-blue-100"
            >
             Subject Master - Semester Mapping
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
