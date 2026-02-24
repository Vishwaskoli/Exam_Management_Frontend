import React, { useEffect, useState } from "react";
import axios from "axios";

const SEM_API = "https://localhost:7248/api/SemesterMaster";
const COURSE_API = "https://localhost:7248/api/CourseMaster";
const MAP_API = "https://localhost:7248/api/CourseSemMapping";

const Course_Sem_Mapping = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);

  const [errors, setErrors] = useState({});

  // ================= FETCH DATA =================
  const fetchSemesters = async () => {
    const res = await axios.get(SEM_API);
    setSemesters(res.data);
  };

  const fetchCourses = async () => {
    const res = await axios.get(`${COURSE_API}/ActiveCourses`);
    setCourses(res.data);
  };

  const fetchMappings = async () => {
    const res = await axios.get(MAP_API);
    setMappings(res.data);
  };

  useEffect(() => {
    fetchSemesters();
    fetchCourses();
    fetchMappings();
  }, []);

  const getCourseName = (id) => {
    const course = courses.find((c) => c.course_Id === id);
    return course ? course.course_Name : "Unknown";
  };

  // ================= HANDLE ADD =================
  const handleAdd = () => {
    setEditingCourseId(null);
    setSelectedCourse("");
    setSelectedSemesters([]);
    setCreatedBy("");
    setErrors({});
    setViewMode("add");
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (map) => {
    setViewMode("edit");
    setEditingCourseId(map.course_Id);
    setSelectedCourse(map.course_Id);

    const courseMappings = mappings.filter((m) => m.course_Id === map.course_Id);
    const semIds = courseMappings.map((m) => m.sem_Id);

    setSelectedSemesters(semIds);
    setErrors({});
  };

  // ================= HANDLE CHECKBOX =================
  const handleCheckboxChange = (id) => {
    if (selectedSemesters.includes(id)) {
      setSelectedSemesters(selectedSemesters.filter((x) => x !== id));
    } else {
      setSelectedSemesters([...selectedSemesters, id]);
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    const validationErrors = {};

    if (!selectedCourse) validationErrors.course = "Please select a course";
    if (selectedSemesters.length === 0)
      validationErrors.semesters = "Please select at least one semester";
    if (!createdBy) validationErrors.createdBy = "Please enter Created By (User ID)";

    // Check for duplicate semesters (only for add)
    if (viewMode === "add") {
      const existingMappings = mappings.filter(
        (m) => m.course_Id === parseInt(selectedCourse)
      );
      const duplicateSem = selectedSemesters.some((semId) =>
        existingMappings.some((m) => m.sem_Id === semId)
      );
      if (duplicateSem) {
        validationErrors.duplicate = "Semester Already Exists for this Course";
      }
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      // If edit → delete old mappings
      if (viewMode === "edit") {
        const oldMappings = mappings.filter((m) => m.course_Id === editingCourseId);
        for (let item of oldMappings) {
          await axios.post(`${MAP_API}/Delete`, {
            Course_Sem_Map_Id: item.Course_Sem_Map_Id,
            Course_Id: item.Course_Id,
            Sem_Id: item.Sem_Id,
            Created_By: item.Created_By
          });
        }
      }

      // Save new mappings
      for (let semId of selectedSemesters) {
        await axios.post(`${MAP_API}/Insert`, {
          Course_Id: parseInt(selectedCourse),
          Sem_Id: semId,
          Created_By: parseInt(createdBy)
        });
      }

      alert("Mapping saved successfully ✅");

      setViewMode("list");
      setSelectedCourse("");
      setSelectedSemesters([]);
      setCreatedBy("");
      setEditingCourseId(null);
      setErrors({});

      fetchMappings();
    } catch (err) {
      console.error(err);
      alert("Error while saving mapping ❌");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete all mappings for this course?")) return;

    try {
      const courseMappings = mappings.filter((m) => m.course_Id === courseId);
      for (let item of courseMappings) {
        await axios.post(`${MAP_API}/Delete`, {
          Course_Sem_Map_Id: item.Course_Sem_Map_Id,
          Course_Id: item.Course_Id,
          Sem_Id: item.Sem_Id,
          Created_By: item.Created_By
        });
      }

      alert("All mappings deleted successfully ✅");
      fetchMappings();
    } catch (err) {
      console.error(err);
      alert("Error deleting mappings ❌");
    }
  };

  // ================= UNIQUE COURSES =================
  const uniqueCourses = [...new Map(mappings.map((m) => [m.course_Id, m])).values()];
  const filteredCourses = uniqueCourses.filter((map) => {
    const courseName = getCourseName(map.course_Id);
    return searchTerm === ""
      ? true
      : courseName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>
      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Course - Semester Mapping</h3>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Mapping
              </button>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Serial Number</th>
                    <th>Course</th>
                    <th width="80">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((map, index) => (
                      <tr key={map.course_Id}>
                        <td>{index + 1}</td>
                        <td>{getCourseName(map.course_Id)}</td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-primary"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              ⋮
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleEdit(map)}
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleDelete(map.course_Id)}
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
                      <td colSpan="3" className="text-center">
                        No Records Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= ADD / EDIT VIEW ================= */}
      {(viewMode === "add" || viewMode === "edit") && (
        <div className="card shadow-sm p-4 mt-3">
          <h4 className="mb-3">
            {viewMode === "edit"
              ? "Edit Course - Semester Mapping"
              : "Add Course - Semester Mapping"}
          </h4>

          {/* Course Dropdown */}
          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className={`form-select ${errors.course ? "is-invalid" : ""}`}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={viewMode === "edit"}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_Id} value={course.course_Id}>
                  {course.course_Name}
                </option>
              ))}
            </select>
            {errors.course && <div className="invalid-feedback">{errors.course}</div>}
          </div>

          {/* Created By */}
          <div className="mb-3">
            <label className="form-label">Created By</label>
            <input
              type="number"
              className={`form-control ${errors.createdBy ? "is-invalid" : ""}`}
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
            {errors.createdBy && <div className="invalid-feedback">{errors.createdBy}</div>}
          </div>

          {/* Semester Checkboxes */}
          <div className="mb-3">
            <label className="form-label fw-bold">Select Semesters</label>
            {errors.semesters && (
              <div className="text-danger mb-2">{errors.semesters}</div>
            )}
            {errors.duplicate && (
              <div className="text-danger mb-2">{errors.duplicate}</div>
            )}
            <div className="row">
              {semesters.map((sem) => {
                const isSelected = selectedSemesters.includes(sem.sem_Id);
                return (
                  <div className="col-md-4 mb-2" key={sem.sem_Id}>
                    <div
                      className={`form-check border rounded p-2 ${
                        isSelected ? "bg-primary text-white" : "bg-white"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleCheckboxChange(sem.sem_Id)}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(sem.sem_Id)}
                        style={{ cursor: "pointer" }}
                      />
                      <label className="form-check-label ms-2">{sem.sem_Name}</label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setViewMode("list")}
            >
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleSave}>
              {viewMode === "edit" ? "Update Mapping" : "Save Mapping"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course_Sem_Mapping;