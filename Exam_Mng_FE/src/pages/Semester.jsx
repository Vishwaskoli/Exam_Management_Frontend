import React, { useEffect, useState } from "react";
import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService";
import { ToastContainer, toast } from "react-toastify";

const Semester = () => {
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({
    sem_Id: 0,
    sem_Name: "",
    created_By: 1,
    modified_By: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [pageMode, setPageMode] = useState("list"); // list | create | edit
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const recordsPerPage = 5;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const res = await getSemesters();
    setSemesters(res.data);
  };

  // ================= SEARCH
  const filteredSemesters = semesters.filter((item) =>
    item.sem_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= PAGINATION
  const totalPages = Math.ceil(filteredSemesters.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredSemesters.slice(
    indexOfFirst,
    indexOfLast
  );

  const getLocationAsync = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error.message);
        }
      );
    }
  });
};
  // ================= SAVE
 const handleSave = async (e) => {
  e.preventDefault();

  try {
    // 📍 Ask for location
    const location = await getLocationAsync();

    const updatedForm = {
      ...form,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (form.sem_Id === 0) {
      // CREATE
      const res = await createSemester(updatedForm);

      setSemesters([
        ...semesters,
        { ...updatedForm, sem_Id: res.data?.id },
      ]);

      toast.success("Semester added 🚀");
    } else {
      // UPDATE
      await updateSemester(updatedForm);

      setSemesters((prev) =>
        prev.map((item) =>
          item.sem_Id === form.sem_Id ? updatedForm : item
        )
      );

      toast.success("Semester updated ✏️");
    }

    setForm({
      sem_Id: 0,
      sem_Name: "",
      created_By: 1,
      modified_By: 1,
    });

    setPageMode("list");
  } catch (err) {
    toast.error("Location permission required ❌");
  }
};

  // ================= DELETE
 const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this semester?"))
    return;

  try {
    // 📍 Ask for location before deleting
    const location = await getLocationAsync();

    await deleteSemester({
      sem_Id: id,
      modified_By: 1,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setSemesters((prev) =>
      prev.filter((item) => item.sem_Id !== id)
    );

    toast.success("Semester deleted 🗑️");
  } catch (err) {
    toast.error("Location permission required ❌");
  }
};

  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>
      <ToastContainer autoClose={2000} />

      {/* ================= LIST VIEW ================= */}
      {pageMode === "list" && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h3>Semester Master</h3>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search Semester"
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <button
                className="btn btn-primary"
                onClick={() => setPageMode("create")}
              >
                + Add Semester
              </button>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover text-center">
                <thead className="table-secondary">
                  <tr>
                    <th>Sr. No</th>
                    <th>Semester Name</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((item, index) => (
                      <tr key={item.sem_Id}>
                        <td>{indexOfFirst + index + 1}</td>
                        <td>{item.sem_Name}</td>

                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-primary"
                              data-bs-toggle="dropdown"
                            >
                              ⋮
                            </button>

                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => {
                                    setForm(item);
                                    setPageMode("edit");
                                  }}
                                >
                                  Edit
                                </button>
                              </li>

                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() =>
                                    handleDelete(item.sem_Id)
                                  }
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end">
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        currentPage === 1 && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage(currentPage - 1)
                        }
                      >
                        Prev
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 && "active"
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage(i + 1)
                          }
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage(currentPage + 1)
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= CREATE / EDIT VIEW ================= */}
      {(pageMode === "create" || pageMode === "edit") && (
        <div className="card shadow-sm p-4 mt-3">
          <h4 className="mb-3">
            {pageMode === "edit"
              ? "Edit Semester"
              : "Add Semester"}
          </h4>

          <div className="mb-3">
            <label className="form-label">Semester Name</label>
            <input
              type="text"
              className="form-control"
              value={form.sem_Name}
              onChange={(e) =>
                setForm({ ...form, sem_Name: e.target.value })
              }
            />
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setPageMode("list")}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              {pageMode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Semester;