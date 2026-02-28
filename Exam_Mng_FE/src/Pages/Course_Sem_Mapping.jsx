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

  // ================= GET LOCATION =================
  const getLocation = () => {
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
          () => reject("Location permission denied")
        );
      }
    });
  };

  // ================= ADD =================
  const handleAdd = () => {
    setEditingCourseId(null);
    setSelectedCourse("");
    setSelectedSemesters([]);
    setCreatedBy("");
    setErrors({});
    setViewMode("add");
  };

  // ================= EDIT =================
  const handleEdit = (map) => {
    setViewMode("edit");
    setEditingCourseId(map.course_Id);
    setSelectedCourse(map.course_Id);

    const courseMappings = mappings.filter(
      (m) => m.course_Id === map.course_Id
    );
    const semIds = courseMappings.map((m) => m.sem_Id);

    setSelectedSemesters(semIds);
    setErrors({});
  };

  // ================= CHECKBOX =================
  const handleCheckboxChange = (id) => {
    if (selectedSemesters.includes(id)) {
      setSelectedSemesters(selectedSemesters.filter((x) => x !== id));
    } else {
      setSelectedSemesters([...selectedSemesters, id]);
    }
  };

  // ================= SAVE =================
const handleSave = async () => {
  try {

    if (!selectedCourse || selectedSemesters.length === 0 || !createdBy) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    // Duplicate check
    const duplicate = selectedSemesters.some((semId) =>
      mappings.some(
        (m) =>
          m.course_Id === parseInt(selectedCourse) &&
          m.sem_Id === semId
      )
    );

    if (duplicate && viewMode === "add") {
      alert("❌ Course Already Exist");
      return;
    }

    const location = await getLocation();

    // EDIT MODE → delete old mappings first
    if (viewMode === "edit") {
      const oldMappings = mappings.filter(
        (m) => m.course_Id === editingCourseId
      );

      for (const item of oldMappings) {
        await axios.post(`${MAP_API}/Delete`, item);
      }
    }

    // INSERT
   for (const semId of selectedSemesters) {
  await axios.post(`${MAP_API}/INSERT`, {
    Course_Sem_Map_Id: 0,
    Course_Id: parseInt(selectedCourse),
    Sem_Id: semId,
    Created_By: parseInt(createdBy),
    Latitude: location.latitude,
    Longitude: location.longitude
  });
}

    alert("✅ Mapping Saved Successfully");

    setViewMode("list");
    setSelectedCourse("");
    setSelectedSemesters([]);
    setCreatedBy("");
    setEditingCourseId(null);

    fetchMappings();

  } catch (error) {
    alert("❌ Location permission required");
  }
};

  // ================= DELETE =================
  const handleDelete = async (courseId) => {
  if (!window.confirm("Delete all mappings for this course?")) return;

  try {
    const courseMappings = mappings.filter(
      (m) => m.course_Id === courseId
    );

    for (let item of courseMappings) {
      await axios.post(`${MAP_API}/DELETE`, {
        Course_Sem_Map_Id: item.course_Sem_Map_Id,
        Modified_By: parseInt(createdBy || 1)
      });
    }

    alert("Mappings deleted successfully ✅");
    fetchMappings();
  } catch (err) {
    console.error(err.response?.data);
    alert("Error deleting mappings ❌");
  }
};
  // ================= UNIQUE COURSES =================
  const uniqueCourses = [
    ...new Map(mappings.map((m) => [m.course_Id, m])).values(),
  ];

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
                    <th>Serial</th>
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
                                  onClick={() =>
                                    handleDelete(map.course_Id)
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

          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
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
          </div>

          <div className="mb-3">
            <label className="form-label">Created By</label>
            <input
              type="number"
              className="form-control"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Select Semesters</label>
            <div className="row">
              {semesters.map((sem) => {
                const isSelected = selectedSemesters.includes(sem.sem_Id);
                return (
                  <div className="col-md-4 mb-2" key={sem.sem_Id}>
                    <div
                      className={`form-check border rounded p-2 ${
                        isSelected ? "bg-primary text-white" : ""
                      }`}
                      onClick={() =>
                        handleCheckboxChange(sem.sem_Id)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                      />
                      <label className="form-check-label ms-2">
                        {sem.sem_Name}
                      </label>
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