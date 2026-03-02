import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://localhost:7248/api/SubjectMaster";

const Subject_Master = () => {
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  //const [activeAction, setActiveAction] = useState(null); // track which row's menu is open
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // subjects per page

  // =============================
  // FETCH SUBJECTS
  // =============================
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // =============================
  // FILTERED SUBJECTS (SEARCH)
  // =============================
  const filteredSubjects = subjects.filter((sub) =>
    sub.subject_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // =============================
  // Pagenation Logic
  // =============================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);


  // =============================
  // GeoLoaction 
  // =============================
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationEnabled(true);
        },
        (error) => {
          alert("Location permission is required to add or edit a subject.");
          console.error(error);
          setLatitude("");
          setLongitude("");
          setLocationEnabled(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocationEnabled(false);
    }
  };



  // =============================
  // OPEN ADD MODAL
  // =============================
  const handleAdd = () => {
    setEditingSubject(null);
    setSubjectName("");
    setUserId("");
    setViewMode("add");
  };

  // =============================
  // OPEN EDIT MODAL
  // =============================
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.subject_Name);
    setUserId("");
    setViewMode("edit");
    setLatitude(subject.latitude || "");
    setLongitude(subject.longitude || "");
  };

  // =============================
  // SAVE (CREATE / UPDATE)
  // =============================
  const handleSave = async () => {
    if (!subjectName.trim()) {
      alert("Subject Name is required");
      return;
    }

    if (!userId) {
      alert("Please enter User ID");
      return;
    }

    const duplicate = subjects.some(
      (sub) =>
        sub.subject_Name.toLowerCase() === subjectName.trim().toLowerCase() &&
        (editingSubject === null || sub.subject_Id !== editingSubject.subject_Id)
    );

    if (duplicate) {
      alert("Subject Name already exists");
      return;
    }

    // Get location before saving
    getCurrentLocation();

    setTimeout(async () => {
      if (!locationEnabled || !latitude || !longitude) {
        alert("Cannot save without location. Please allow location access.");
        return;
      }

      try {
        if (editingSubject === null) {
          await axios.post(`${API_BASE_URL}/Create`, {
            Subject_Name: subjectName,
            Latitude: parseFloat(latitude),
            Longitude: parseFloat(longitude),
            Created_By: parseInt(userId),
          });
        } else {
          await axios.post(`${API_BASE_URL}/Update`, {
            Subject_Id: editingSubject.subject_Id,
            Subject_Name: subjectName,
            Latitude: parseFloat(latitude),
            Longitude: parseFloat(longitude),
            Modified_By: parseInt(userId),
          });
        }

        setViewMode("list");
        fetchSubjects();

        // Reset location
        setLatitude("");
        setLongitude("");
        setLocationEnabled(false);
      } catch (err) {
        console.error("Error saving subject:", err);
        alert("Error saving subject. See console for details.");
      }
    }, 800);
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      await axios.post(`${API_BASE_URL}/Delete/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error("Error deleting subject", err);
    }
  };

  return (
    <div className="container mt-2" style={{ paddingTop: "100px" }}>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Subject Master</h3>

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search subject..."
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Subject
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Serial Number</th>
                    <th>Subject Name</th>
                    <th style={{ width: "80px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentSubjects.length > 0 ? (
                    currentSubjects.map((sub, index) => (
                      <tr key={sub.subject_Id}>
                        <td>{index + 1}</td>
                        <td>{sub.subject_Name}</td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-primary"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              ⋮
                            </button>

                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleEdit(sub)}
                                >
                                  Edit
                                </button>
                              </li>

                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleDelete(sub.subject_Id)}
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

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADD / EDIT VIEW */}
      {(viewMode === "add" || viewMode === "edit") && (
        <div className="card shadow-sm p-4 mt-3">
          <h4 className="mb-3">
            {viewMode === "edit" ? "Edit Subject" : "Add Subject"}
          </h4>

          <div class="relative mb-3">
            <input type="text"
              onChange={e => setSubjectName(e.target.value)}
              id="small_outlined"
              value={subjectName}
              class="block px-2.5 pb-1.5 pt-3 w-full 
              text-sm text-heading bg-transparent 
              rounded-base border-1 border-default-medium 
              appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" " />
            <label for="small_outlined"
              class="absolute text-sm text-body duration-300 transform -translate-y-3 
            scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 
            peer-focus:text-fg-brand peer-placeholder-shown:scale-100 
            peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
            peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Subject Name
            </label>
          </div>

          <div class="relative mb-3">
            <input type="number"
              onChange={e => setUserId(e.target.value)}
              id="small_outlined"
              value={userId}
              class="block px-2.5 pb-1.5 pt-3 w-full 
              text-sm text-heading bg-transparent 
              rounded-base border-1 border-default-medium 
              appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder="User Id" />
            <label for="small_outlined"
              class="absolute text-sm text-body duration-300 transform -translate-y-3 
            scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 
            peer-focus:text-fg-brand peer-placeholder-shown:scale-100 
            peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
            peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              {viewMode === "edit"
                ? "Modified By (User ID)"
                : "Created By (User ID)"}
            </label>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setViewMode("list")}
            >
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleSave}>
              {viewMode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject_Master;
