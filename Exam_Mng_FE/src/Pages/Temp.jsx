// import React, { useEffect, useState } from "react";

// const Temp = () => {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [newCourseName, setNewCourseName] = useState("");
//   const [createLoading, setCreateLoading] = useState(false);

//   // ================= FETCH =================
//   const fetchCourses = async () => {
//     try {
//       const response = await fetch(
//         "https://localhost:7248/api/CourseMaster/ActiveCourses"
//       );

//       if (!response.ok) throw new Error("Failed to fetch courses");

//       const data = await response.json();
//       setCourses(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const filteredCourses = courses.filter((course) =>
//     course.course_Name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // ================= CREATE =================
//   const handleCreate = async () => {
//     if (!newCourseName.trim()) return;

//     try {
//       setCreateLoading(true);

//       const response = await fetch(
//         "https://localhost:7248/api/CourseMaster",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             course_Name: newCourseName,
//             created_By: 1,
//           }),
//         }
//       );

//       if (!response.ok) throw new Error();

//       setShowCreateModal(false);
//       setNewCourseName("");
//       fetchCourses();
//     } catch {
//       alert("Error creating course");
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   // ================= EDIT =================
//   const handleEdit = (course) => {
//     setSelectedCourse(course);
//     setEditName(course.course_Name);
//     setShowEditModal(true);
//   };

//   const handleUpdate = async () => {
//     if (!editName.trim()) return;

//     try {
//       const response = await fetch(
//         `https://localhost:7248/api/CourseMaster/UpdateCourse/${selectedCourse.course_Id}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             course_Id: selectedCourse.course_Id,
//             course_Name: editName,
//             modified_By: 1,
//           }),
//         }
//       );

//       if (!response.ok) throw new Error();

//       setShowEditModal(false);
//       fetchCourses();
//     } catch {
//       alert("Error updating course");
//     }
//   };

//   // ================= DELETE =================
//   const openDeleteModal = (course) => {
//     setSelectedCourse(course);
//     setShowDeleteModal(true);
//   };

//   const handleDelete = async () => {
//     try {
//       const response = await fetch(
//         `https://localhost:7248/api/CourseMaster/DeleteCourse/${selectedCourse.course_Id}`,
//         { method: "POST" }
//       );

//       if (!response.ok) throw new Error();

//       setShowDeleteModal(false);
//       fetchCourses();
//     } catch {
//       alert("Error deleting course");
//     }
//   };

//   // ================= LOADING =================
//   if (loading)
//     return (
//       <div className="text-center mt-5">
//         <div className="spinner-border text-primary"></div>
//       </div>
//     );

//   if (error) return <div className="alert alert-danger">{error}</div>;

//   // ================= UI =================
//   return (
//     <div className="container-fluid bg-light min-vh-100 py-4">
//       <div className="container">

//         {/* HEADER */}
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h2 className="fw-bold">Course Master</h2>

//           <div className="d-flex gap-3">

//             {/* Floating Search */}
//             <div className="form-floating" style={{ width: "250px" }}>
//               <input
//                 type="text"
//                 className="form-control"
//                 id="search"
//                 placeholder="Search"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <label htmlFor="search">Search Course...</label>
//             </div>

//             <button
//               className="btn btn-primary px-3"
//               onClick={() => setShowCreateModal(true)}
//             >
//               + Add Subject
//             </button>
//           </div>
//         </div>

//         {/* TABLE CARD */}
//         <div className="card shadow-sm border-0 rounded-3">
//           <div className="card-body p-0">
//             <table className="table mb-0 align-middle">
//               <thead className="bg-light">
//                 <tr>
//                   <th className="ps-4">Serial Number</th>
//                   <th>Course Name</th>
//                   <th className="text-end pe-4">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCourses.length > 0 ? (
//                   filteredCourses.map((course, index) => (
//                     <tr key={course.course_Id}>
//                       <td className="ps-4">{index + 1}</td>
//                       <td>{course.course_Name}</td>
//                       <td className="text-end pe-4">
//                         <div className="dropdown">
//                           <button
//                             className="btn btn-sm btn-primary"
//                             data-bs-toggle="dropdown"
//                           >
//                             ⋮
//                           </button>
//                           <ul className="dropdown-menu dropdown-menu-end">
//                             <li>
//                               <button
//                                 className="dropdown-item"
//                                 onClick={() => handleEdit(course)}
//                               >
//                                 Edit
//                               </button>
//                             </li>
//                             <li>
//                               <button
//                                 className="dropdown-item text-danger"
//                                 onClick={() => openDeleteModal(course)}
//                               >
//                                 Delete
//                               </button>
//                             </li>
//                           </ul>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="text-center py-4">
//                       No subjects found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ================= CREATE MODAL ================= */}
//         {showCreateModal && (
//           <div className="modal show d-block">
//             <div className="modal-dialog">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5>Create Subject</h5>
//                   <button
//                     className="btn-close"
//                     onClick={() => setShowCreateModal(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="form-floating">
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="Course Name"
//                       value={newCourseName}
//                       onChange={(e) => setNewCourseName(e.target.value)}
//                     />
//                     <label>Subject Name</label>
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => setShowCreateModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="btn btn-primary"
//                     onClick={handleCreate}
//                     disabled={createLoading}
//                   >
//                     {createLoading ? "Saving..." : "Save"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= EDIT MODAL ================= */}
//         {showEditModal && (
//           <div className="modal show d-block">
//             <div className="modal-dialog">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5>Edit Subject</h5>
//                   <button
//                     className="btn-close"
//                     onClick={() => setShowEditModal(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="form-floating">
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={editName}
//                       onChange={(e) => setEditName(e.target.value)}
//                     />
//                     <label>Subject Name</label>
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => setShowEditModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button className="btn btn-success" onClick={handleUpdate}>
//                     Update
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= DELETE MODAL ================= */}
//         {showDeleteModal && (
//           <div className="modal show d-block">
//             <div className="modal-dialog modal-sm">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5>Confirm Delete</h5>
//                 </div>
//                 <div className="modal-body text-center">
//                   Are you sure you want to delete <br />
//                   <strong>{selectedCourse?.course_Name}</strong> ?
//                 </div>
//                 <div className="modal-footer justify-content-center">
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => setShowDeleteModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     className="btn btn-danger"
//                     onClick={handleDelete}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default Temp;
