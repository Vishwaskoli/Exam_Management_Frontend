import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://localhost:7248/api/SubjectMaster";

const Subject_Master = () => {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [userId, setUserId] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
  // OPEN ADD MODAL
  // =============================
  const handleAdd = () => {
    setEditingSubject(null);
    setSubjectName("");
    setUserId("");
    setShowModal(true);
  };

  // =============================
  // OPEN EDIT MODAL
  // =============================
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.subject_Name);
    setUserId("");
    setShowModal(true);
  };

  // =============================
  // SAVE (CREATE / UPDATE)
  // =============================
  const handleSave = async () => {
    if (!subjectName.trim()) {
      alert("Subject Name is required");
      return;
    }

    try {
      if (editingSubject === null) {
        await axios.post(`${API_BASE_URL}/Create`, {
          Subject_Name: subjectName,
          Created_By: parseInt(userId),
        });
      } else {
        await axios.post(`${API_BASE_URL}/Update`, {
          Subject_Id: editingSubject.subject_Id,
          Subject_Name: subjectName,
          Modified_By: parseInt(userId),
        });
      }

      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      console.error("Error saving subject", err);
    }
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
    <div className="container mt-2">
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
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub, index) => (
                  <tr key={sub.subject_Id}>
                    <td>{index + 1}</td>
                    <td>{sub.subject_Name}</td>

                    {/* ACTION COLUMN */}
                    <td style={{ position: "relative" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setActiveAction(
                            activeAction === sub.subject_Id
                              ? null
                              : sub.subject_Id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {activeAction === sub.subject_Id && (
                        <div
                          className="card shadow-sm p-2"
                          style={{
                            position: "absolute",
                            top: "40px",
                            right: "0",
                            zIndex: 1000,
                            minWidth: "120px",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-outline-primary w-100 mb-1"
                            onClick={() => {
                              handleEdit(sub);
                              setActiveAction(null);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger w-100"
                            onClick={() => {
                              handleDelete(sub.subject_Id);
                              setActiveAction(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSubject ? "Edit Subject" : "Add Subject"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="subjectName"
                    placeholder="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                  />
                  <label htmlFor="subjectName">Subject Name</label>
                </div>


                <div className="form-floating mb-3">
                  <input
                    type="number"
                    className="form-control"
                    id="userId"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <label htmlFor="userId">
                    {editingSubject ? "Modified By (User ID)" : "Created By (User ID)"}
                  </label>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  {editingSubject ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default Subject_Master;
