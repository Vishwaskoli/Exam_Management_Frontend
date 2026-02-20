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
    if (!createdBy) {
      alert("Please enter Created By (User ID)");
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
      alert(`Error ${err.message} while saving mapping`);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Subject - Semester Mapping</h3>

      <div className="card shadow-sm p-4 mt-3">

        {/* Semester Dropdown */}
        <div className="relative mb-3">
          <select
            id="semesterSelect"
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="peer block w-full bg-transparent text-sm text-heading rounded-base border-1 border-default-medium 
               appearance-none px-2.5 pt-3 pb-1.5 focus:outline-none focus:ring-0 focus:border-brand"
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem.sem_Id} value={sem.sem_Id}>
                {sem.sem_Name}
              </option>
            ))}
          </select>

          <label
            htmlFor="semesterSelect"
            className="absolute left-2.5 top-1 z-10 text-sm text-body duration-300 
               transform -translate-y-3 scale-75 bg-white px-1 
               peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 
               peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 
               peer-placeholder-shown:scale-100"
          >
            Semester
          </label>
        </div>

        {/* Created By */}
        <div className="relative mb-4">
          <input
            type="number"
            id="createdBy"
            placeholder=" "
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            className="peer block w-full bg-transparent text-sm text-heading rounded-base border-1 border-default-medium
               appearance-none px-2.5 pt-3 pb-1.5 focus:outline-none focus:ring-0 focus:border-brand"
          />
          <label
            htmlFor="createdBy"
            className="absolute left-2.5 top-1 z-10 text-sm text-body duration-300
               transform -translate-y-3 scale-75 bg-white px-1
               peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3
               peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
               peer-placeholder-shown:scale-100"
          >
            Created By (User ID)
          </label>
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
