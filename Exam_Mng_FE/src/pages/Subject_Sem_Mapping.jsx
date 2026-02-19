import React, { useEffect, useState } from "react";
import axios from "axios";

const SEM_API = "https://localhost:7248/api/SemesterMaster";
const SUB_API = "https://localhost:7248/api/SubjectMaster";
const MAP_API = "https://localhost:7248/api/SubjectSemMapping";

const Subject_Sem_Mapping = () => {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [createdBy, setCreatedBy] = useState("");

  // =============================
  // FETCH SEMESTERS
  // =============================
  const fetchSemesters = async () => {
    const res = await axios.get(SEM_API);
    setSemesters(res.data);
  };

  // =============================
  // FETCH SUBJECTS
  // =============================
  const fetchSubjects = async () => {
    const res = await axios.get(SUB_API);
    setSubjects(res.data);
  };

  useEffect(() => {
    fetchSemesters();
    fetchSubjects();
  }, []);

  // =============================
  // HANDLE CHECKBOX CHANGE
  // =============================
  const handleCheckboxChange = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((x) => x !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  // =============================
  // SAVE MAPPING
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

    try {
      for (let subId of selectedSubjects) {
        await axios.post(`${MAP_API}/Create`, {
          Sub_Id: subId,
          Sem_Id: parseInt(selectedSem),
          Created_By: parseInt(createdBy),
        });
      }

      alert("Mapping saved successfully");

      setSelectedSubjects([]);
      setSelectedSem("");
    } catch (err) {
      console.error(err);
      alert("Error saving mapping");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Subject - Semester Mapping</h3>

      <div className="card shadow-sm p-4 mt-3">

        {/* Semester Dropdown */}
        <div className="form-floating mb-3">
          <select
            className="form-select"
            id="semesterSelect"
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
          <label htmlFor="semesterSelect">Semester</label>
        </div>

        {/* Created By */}
        <div className="form-floating mb-4">
          <input
            type="number"
            className="form-control"
            id="createdBy"
            placeholder="Created By"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
          />
          <label htmlFor="createdBy">Created By (User ID)</label>
        </div>

        {/* Subject Checkbox List */}
        <div className="mb-3">
          <label className="form-label fw-bold">Select Subjects</label>

          <div className="row">
            {subjects.map((sub) => (
              <div className="col-md-4" key={sub.subject_Id}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={sub.subject_Id}
                    id={`sub_${sub.subject_Id}`}
                    checked={selectedSubjects.includes(sub.subject_Id)}
                    onChange={() => handleCheckboxChange(sub.subject_Id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`sub_${sub.subject_Id}`}
                  >
                    {sub.subject_Name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button className="btn btn-primary mt-3" onClick={handleSave}>
          Save Mapping
        </button>

      </div>
    </div>
  );
};

export default Subject_Sem_Mapping;
