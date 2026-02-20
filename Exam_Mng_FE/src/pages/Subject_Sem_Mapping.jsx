import React, { useEffect, useState } from "react";
import axios from "axios";

const SEM_API = "https://localhost:7248/api/SemesterMaster";
const SUB_API = "https://localhost:7248/api/SubjectMaster";
const MAP_API = "https://localhost:7248/api/SubjectSemMapping";

const Subject_Sem_Mapping = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [selectedSem, setSelectedSem] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [createdBy, setCreatedBy] = useState("");

  const [editingSemId, setEditingSemId] = useState(null);

  // =============================
  // FETCH DATA
  // =============================
  const fetchSemesters = async () => {
    const res = await axios.get(SEM_API);
    setSemesters(res.data);
  };

  const fetchSubjects = async () => {
    const res = await axios.get(SUB_API);
    setSubjects(res.data);
  };

  const fetchMappings = async () => {
    const res = await axios.get(MAP_API);
    console.log("Mappings:", res.data);
    setMappings(res.data);
  };

  const getSemesterName = (id) => {
    const sem = semesters.find((s) => s.sem_Id === id);
    return sem ? sem.sem_Name : "Unknown";
  };

  const handleEdit = async (map) => {
    try {
      console.log("Edit clicked:", map);
      setViewMode("edit");
      setEditingSemId(map.sem_Id);
      setSelectedSem(map.sem_Id);

      // Get all mappings
      const res = await axios.get(MAP_API);

      // Filter mappings of selected semester
      const semesterMappings = res.data.filter(
        (m) => m.sem_Id === map.sem_Id
      );

      // Extract subject IDs
      const subjectIds = semesterMappings.map((m) => m.sub_Id);

      setSelectedSubjects(subjectIds);
    } catch (err) {
      console.error("Error loading mapping for edit", err);
    }
  };


  useEffect(() => {
    fetchSemesters();
    fetchSubjects();
    fetchMappings();
  }, []);

  // =============================
  // FILTERED MAPPINGS
  // =============================
  // const filteredMappings = mappings.filter((map) =>
  // map.subject_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // =============================
  // HANDLE CHECKBOX
  // =============================
  const handleCheckboxChange = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((x) => x !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  // =============================
  // SAVE
  // =============================
  const handleSave = async () => {
    if (!selectedSem) {
      alert("Please select Semester");
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one Subject");
      return;
    }

    if (!createdBy) {
      alert("Please enter User ID");
      return;
    }

    try {
      // If editing → delete old mappings first
      if (viewMode === "edit") {
        const res = await axios.get(MAP_API);
        const oldMappings = res.data.filter(
          (m) => m.sem_Id === editingSemId
        );

        for (let item of oldMappings) {
          await axios.post(`${MAP_API}/Delete/${item.sub_Sem_Map_Id}`);
        }
      }

      // Create new mappings
      for (let subId of selectedSubjects) {
        await axios.post(`${MAP_API}/Create`, {
          Sub_Id: subId,
          Sem_Id: parseInt(selectedSem),
          Created_By: parseInt(createdBy),
        });
      }

      alert("Mapping saved successfully");

      setViewMode("list");
      setSelectedSubjects([]);
      setSelectedSem("");
      setEditingSemId(null);

      fetchMappings();
    } catch (err) {
      console.error(err);
      alert("Error while saving mapping");
    }
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (semId) => {
  if (!window.confirm("Delete all mappings for this semester?")) return;

  try {
    await axios.post(`${MAP_API}/DeleteBySemester/${semId}`);
    fetchMappings();
    alert("All mappings deleted successfully");
  } catch (err) {
    console.error(err);
    alert("Error deleting mappings: " + err.message);
  }
  fetchMappings();
};

//==============================
// Handel Add
//==============================
const handleAdd = () => {
  setEditingSemId(null);     // clear editing reference
  setSelectedSem("");        // clear semester
  setSelectedSubjects([]);   // uncheck all subjects
  setCreatedBy("");          // clear user id
  setViewMode("add");        // switch view
};


  const uniqueSemesters = [
    ...new Map(mappings.map((m) => [m.sem_Id, m])).values(),
  ];


  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>

      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Subject - Semester Mapping</h3>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="btn btn-primary"
                onClick={handleAdd}
              >
                + Add Mapping
              </button>
            </div>
          </div>

          {/* Table */}
          {/* TABLE */}
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Serial Number</th>
                    <th>Semester</th>
                    <th width="80">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {uniqueSemesters.length > 0 ? (
                    uniqueSemesters.map((map, index) => (
                      <tr key={map.sem_Id}>
                        <td>{index + 1}</td>

                        <td>{getSemesterName(map.sem_Id)}</td>

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
                                  onClick={() => handleDelete(map.sem_Id)}
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

      {/* ================= ADD VIEW ================= */}
      {(viewMode === "add" || viewMode === "edit" ) && (
        <div className="card shadow-sm p-4 mt-3">
          <h4 className="mb-3">{viewMode === "edit"
            ? "Edit Subject - Semester Mapping"
            : "Add Subject - Semester Mapping"}</h4>

          {/* Semester Dropdown */}
          <div className="mb-3">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem.sem_Id} value={sem.sem_Id}>
                  {sem.sem_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Created By */}
          <div className="mb-3">
            <label className="form-label">Created By</label>
            <input
              type="number"
              className="form-control"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>

          {/* Subject Checkbox List */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Select Subjects
            </label>
            <div className="row">
              {subjects.map((sub) => (
                <div className="col-md-4" key={sub.subject_Id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedSubjects.includes(sub.subject_Id)}
                      onChange={() =>
                        handleCheckboxChange(sub.subject_Id)
                      }
                    />
                    <label className="form-check-label">
                      {sub.subject_Name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setViewMode("list")}
            >
              Cancel
            </button>

            <button className="btn btn-primary mt-3" onClick={handleSave}>
              {viewMode === "edit" ? "Update Mapping" : "Save Mapping"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject_Sem_Mapping;