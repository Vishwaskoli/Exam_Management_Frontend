import React, { useEffect, useState } from "react";
import axios from "axios";

const SEM_API = "https://localhost:7248/api/SemesterMaster";
const SUB_API = "https://localhost:7248/api/SubjectMaster";
const MAP_API = "https://localhost:7248/api/SubjectSemMapping";
const COURSE_API = "https://localhost:7248/api/CourseMaster";
const COURSE_SEM_API = "https://localhost:7248/api/CourseSemMapping";

const Subject_Sem_Mapping = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [selectedSem, setSelectedSem] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [createdBy, setCreatedBy] = useState(""); // for add
  const [modifiedBy, setModifiedBy] = useState(""); // for edit

  const [editingSemId, setEditingSemId] = useState(null);

  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseSemesters, setCourseSemesters] = useState([]);

  const [courseSemMappings, setCourseSemMappings] = useState([]);

  // =============================
  // FETCH DATA
  // =============================
  const fetchCourses = async () => {
    const res = await axios.get(COURSE_API);
    setCourses(res.data);
  };

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

  const fetchSemestersByCourse = async (courseId) => {
    if (!courseId) {
      setCourseSemesters([]);
      return;
    }
    try {
      const res = await axios.get(`${COURSE_SEM_API}/GetByCourse/${courseId}`);
      // res.data is your mapping JSON
      const mappedSemIds = res.data.map((x) => x.sem_Id);
      const filtered = semesters.filter((sem) => mappedSemIds.includes(sem.sem_Id));
      setCourseSemesters(filtered);
    } catch (error) {
      console.error("Error fetching semesters by course:", error);
    }
  };

  const fetchCourseSemMappings = async () => {
    try {
      const res = await axios.get(COURSE_SEM_API);
      setCourseSemMappings(res.data);
    } catch (err) {
      console.error("Error fetching course-sem mappings:", err);
    }
  };

  const checkSubjectExists = async (courseId, semId, subId) => {
    const res = await axios.get(`${MAP_API}/CheckCourseSemester`, {
      params: { courseId, semId } // optionally modify backend to accept subId
    });
    // if you modify backend to accept subId, you can do:
    // exists = res.data.existsForThisSubject
    return res.data.exists;
  };

  const subjectExists = (courseId, semId, subId) => {
    return mappings.some(
      (m) =>
        m.course_Id === parseInt(courseId) &&
        m.sem_Id === parseInt(semId) &&
        m.sub_Id === parseInt(subId)
    );
  };

  // ✅ Returns true/false if mapping exists
  const checkMappingExists = async (courseId, semId) => {
    try {
      const res = await axios.get(`${MAP_API}/CheckCourseSemester`, {
        params: { courseId, semId }
      });

      console.log("Check Mapping Exists Response:", res.data.exists);

      // API returns { exists: true/false }
      return res.data.exists;
    } catch (err) {
      console.error("Error checking mapping existence:", err);
      return false; // default to false if API fails
    }
  };

  const res = checkMappingExists(selectedCourse, selectedSem);
  console.log(res.data);

  useEffect(() => {
    fetchCourseSemMappings();
  }, []);


  const uniqueMappings = [
    ...new Map(
      mappings.map(item => [
        `${item.course_Id}-${item.sem_Id}`,
        item
      ])
    ).values()
  ];

  const handleEdit = async (map) => {
    try {
      console.log("Edit clicked:", map);
      setViewMode("edit");
      setEditingSemId(map.sub_Sem_Map_Id);
      setSelectedSem(map.sem_Id);
      setSelectedCourse(map.course_Id);
      setModifiedBy("");

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
    if (!selectedCourse || semesters.length === 0 || courseSemMappings.length === 0) {
      setCourseSemesters([]);
      return;
    }

    // Find semesters mapped to the selected course
    const mappedSemIds = courseSemMappings
      .filter((m) => m.course_Id === parseInt(selectedCourse))
      .map((m) => m.sem_Id);

    // Only keep semesters that exist in the main semester list
    const filtered = semesters.filter((sem) => mappedSemIds.includes(sem.sem_Id));

    setCourseSemesters(filtered);
  }, [selectedCourse, semesters, courseSemMappings]);

  useEffect(() => {
    fetchSemesters();
    fetchSubjects();
    fetchMappings();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSemestersByCourse(selectedCourse);
  }, [selectedCourse, semesters]);

  // =============================
  // FILTERED MAPPINGS (SEARCH)
  // =============================
  //   const filteredSemesters = uniqueSemesters.filter((map) => {
  //   const semName = getSemesterName(map.sem_Id);
  //   return semName?.toLowerCase().includes(searchTerm.toLowerCase());
  // });

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

    // 🔹 Common Validations
    if (!selectedCourse) {
      alert("Please select Course");
      return;
    }

    if (!selectedSem) {
      alert("Please select Semester");
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one Subject");
      return;
    }

    if (viewMode === "add" && !createdBy) {
      alert("Please enter User ID");
      return;
    }

    if (viewMode === "edit" && !modifiedBy) {
      alert("Please enter Modified By");
      return;
    }

    try {

      // 🔵 ADD MODE
      if (viewMode === "add") {

        for (let subId of selectedSubjects) {
          await axios.post(`${MAP_API}/Create`, {
            Course_Id: parseInt(selectedCourse),
            Sub_Id: subId,
            Sem_Id: parseInt(selectedSem),
            Created_By: parseInt(createdBy)
          });
        }

        alert("Mapping saved successfully");
      }

      // 🟡 EDIT MODE
      else if (viewMode === "edit") {

        await axios.post(`${MAP_API}/Update`, {
          Course_Id: parseInt(selectedCourse),
          Sem_Id: parseInt(selectedSem),
          SubjectIds: selectedSubjects,
          Modified_By: parseInt(modifiedBy)
        });

        alert("Mapping updated successfully");
      }

      fetchMappings();
      setViewMode("list");

    } catch (err) {
      console.error("Error saving mapping:", err.response?.data || err.message);
      alert(err.response?.data.error);
    }
  };
  // const handleSave = async () => {
  //   if (!selectedCourse) {
  //     alert("Please select Course");
  //     return;
  //   }
  //   if (!selectedSem) {
  //     alert("Please select Semester");
  //     return;
  //   }

  //   if (selectedSubjects.length === 0) {
  //     alert("Please select at least one Subject");
  //     return;
  //   }

  //   if (viewMode === "add" && !createdBy) {
  //     alert("Please enter User ID");
  //     return;
  //   }

  //   if (viewMode === "edit" && !modifiedBy) {
  //     alert("Please enter Modified By");
  //     return;
  //   }
  //   // if (!createdBy && viewMode === "add") {
  //   //   alert("Please enter Created By ID");
  //   //   return;
  //   // }

  //   // if (!modifiedBy && viewMode === "edit") {
  //   //   alert("Please enter Modified By ID");
  //   //   return;
  //   // }

  //   // if (viewMode === "add") {

  //   //   const duplicateSubjects = selectedSubjects.filter((subId) =>
  //   //     mappings.some(
  //   //       (m) =>
  //   //         m.sem_Id === parseInt(selectedSem) &&
  //   //         m.course_Id === parseInt(selectedCourse) &&
  //   //         m.sub_Id === subId
  //   //     )
  //   //   );

  //   //   if (duplicateSubjects.length > 0) {
  //   //     alert("One or more selected subjects already mapped for this Course & Semester!");
  //   //     return;
  //   //   }
  //   // }

  //   try {

  //     if (viewMode === "edit") {

  //       // 🔥 Step 1: Delete old mappings for this Course + Semester
  //       await axios.post(`${MAP_API}/DeleteBySemesterAndCourse`, {
  //         Sem_Id: parseInt(selectedSem),
  //         Course_Id: parseInt(selectedCourse),
  //         Modified_By: parseInt(modifiedBy)
  //       });

  //       // 🔥 Step 2: Insert newly selected subjects
  //       for (let subId of selectedSubjects) {
  //         await axios.post(`${MAP_API}/Create`, {
  //           Course_Id: parseInt(selectedCourse),
  //           Sub_Id: subId,
  //           Sem_Id: parseInt(selectedSem),
  //           Created_By: parseInt(modifiedBy)
  //         });
  //       }

  //       alert("Mapping updated successfully");
  //       setViewMode("list");
  //       fetchMappings();
  //       return;
  //     }

  //     // 🔵 ADD MODE
  //     // 🔵 ADD MODE
  //     if (viewMode === "add") {
  //       console.log("Checking for existing mapping with Course_Id:", selectedCourse, "Sem_Id:", selectedSem);
  //       const exists = await checkMappingExists(selectedCourse, selectedSem);
  //       console.log("Mapping exists:", exists);
  //       if (exists) {
  //         alert("Mapping for this Course & Semester already exists!");
  //         return; // stop adding duplicates
  //       }

  //       // Add new subjects
  //       for (let subId of selectedSubjects) {
  //         await axios.post(`${MAP_API}/Create`, {
  //           Course_Id: parseInt(selectedCourse),
  //           Sub_Id: subId,
  //           Sem_Id: parseInt(selectedSem),
  //           Created_By: parseInt(createdBy)
  //         });
  //       }
  //     }

  //   } catch (err) {
  //     console.error(err);
  //     alert(err);
  //   }
  // };

  //   try {
  //     // If editing → delete old mappings first
  //     // if (viewMode === "edit") {
  //     //   await axios.post(`${MAP_API}/DeleteBySemesterAndCourse`, {
  //     //     Sem_Id: parseInt(selectedSem),
  //     //     Course_Id: parseInt(selectedCourse),
  //     //     Modified_By: parseInt(modifiedBy)
  //     //   });

  //     // }
  //     if (viewMode === "edit") {
  //       for (let subId of selectedSubjects) {
  //         await axios.post(`${MAP_API}/Update`, {
  //           Sub_Sem_Map_Id: editingSemId,
  //           Course_Id: parseInt(selectedCourse),
  //           Sub_Id: subId,
  //           Sem_Id: parseInt(selectedSem),
  //           Modified_By: parseInt(modifiedBy),
  //         });
  //       }

  //       alert("Mapping updated successfully");
  //       setViewMode("list");
  //       fetchMappings();
  //       return;
  //     }

  //     // Create new mappings
  //     for (let subId of selectedSubjects) {
  //       await axios.post(`${MAP_API}/Create`, {
  //         Course_Id: parseInt(selectedCourse), // Assuming Course_Id is required, set it to a default or selected value
  //         Sub_Id: subId,
  //         Sem_Id: parseInt(selectedSem),
  //         Created_By: viewMode === "add" ? parseInt(createdBy) : undefined,
  //         Modified_By: viewMode === "edit" ? parseInt(modifiedBy) : undefined,
  //       });
  //     }

  //     alert("Mapping saved successfully");

  //     setViewMode("list");
  //     setSelectedSubjects([]);
  //     setSelectedSem("");
  //     setEditingSemId(null);

  //     fetchMappings();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error while saving mapping");
  //   }
  // };

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
    setSelectedCourse("");   // clear course selection
    setEditingSemId(null);     // clear editing reference
    setSelectedSem("");        // clear semester
    setSelectedSubjects([]);   // uncheck all subjects
    setCreatedBy("");          // clear user id
    setViewMode("add");        // switch view
  };


  const uniqueSemesters = [
    ...new Map(mappings.map((m) => [m.sem_Id, m])).values(),
  ];

  console.log("Unique Semesters:", uniqueSemesters);


  const filteredSemesters = uniqueSemesters.filter((map) => {
    const semName = getSemesterName(map.sem_Id);
    return searchTerm === ""
      ? true
      : semName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCourseName = (id) => {
    const course = courses.find((c) => c.course_Id === id);
    return course ? course.course_Name : "Unknown";
  };

  console.log("Subjects:", subjects);

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
                    <th>Course</th>
                    <th>Semester</th>
                    <th width="80">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {uniqueMappings.length > 0 ? (
                    uniqueMappings.map((map, index) => (
                      <tr key={`${map.course_Id}-${map.sem_Id}`}>
                        <td>{index + 1}</td>
                        <td>{getCourseName(map.course_Id)}</td>
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
      {(viewMode === "add" || viewMode === "edit") && (
        <div className="card shadow-sm p-4 mt-3 h-100">
          <h4 className="mb-3">{viewMode === "edit"
            ? "Edit Subject - Semester Mapping"
            : "Add Subject - Semester Mapping"}</h4>

          {/* Course Dropdown */}
          <div className="mb-3">
            <label className="form-label">Course</label>
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_Id} value={course.course_Id}>
                  {course.course_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div className="mb-3">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="">Select Semester</option>
              {courseSemesters.map((sem) => (
                <option key={sem.sem_Id} value={sem.sem_Id}>
                  {sem.sem_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Created By */}
          <div className="mb-3">
            <label className="form-label">
              {viewMode === "edit" ? "Modified By" : "Created By"}
            </label>
            <input
              type="number"
              className="form-control"
              value={viewMode === "edit" ? modifiedBy : createdBy}
              onChange={(e) =>
                viewMode === "edit"
                  ? setModifiedBy(e.target.value)
                  : setCreatedBy(e.target.value)
              }
            />
          </div>

          {/* Subject Checkbox List */}
          <div className="mb-3">
            <label className="form-label fw-bold">Select Subjects</label>
            <div className="row">
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <div className="col-md-4" key={sub.subject_Id}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`sub-${sub.subject_Id}`}
                        checked={selectedSubjects.includes(sub.subject_Id)}
                        onChange={() => handleCheckboxChange(sub.subject_Id)}
                      />
                      <label className="form-check-label" htmlFor={`sub-${sub.subject_Id}`}>
                        {sub.subject_Name}
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-muted">No subjects available</div>
              )}
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

export default Subject_Sem_Mapping;