import React, { useEffect, useState } from "react";

const CourseMaster = () => {
    const API_BASE_URL = "https://localhost:7248/api/CourseMaster";

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;

    // const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [editName, setEditName] = useState("");

    // const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    // const [createPage, setCreatePage] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [pageMode, setPageMode] = useState("list");
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [locationEnabled, setLocationEnabled] = useState(false);
    // "list" | "create" | "edit"

    //get location access
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLocationEnabled(true);
            },
            (error) => {
              setErrorMessage("Unable to retrieve location. Please enable location services.");
            //   console.error(error);
              setLocationEnabled(false);
            }
          );
        } else {
          setErrorMessage("Geolocation is not supported by your browser.");
          setLocationEnabled(false);
        }
      };
    
    
      // Effects
      useEffect(() => {
        getCurrentLocation();
      }, []);

    // Fetch Courses
    const fetchCourses = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/ActiveCourses`
            );

            if (!response.ok) throw new Error("Failed to fetch courses");

            const data = await response.json();
            setCourses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter((course) =>
        course.course_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
const indexOfLastCourse = currentPage * coursesPerPage;
const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

const paginate = (pageNumber) => setCurrentPage(pageNumber);
    // CREATE
   const handleCreate = async () => {
    if (!newCourseName.trim()) {
        alert("Course name is required");
        return;
    }

    if (!locationEnabled) {
        alert("Location access is required to create a course");
        return;
    }

    try {
        setCreateLoading(true);

        const response = await fetch(
            `${API_BASE_URL}/CreateCourse`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    course_Name: newCourseName,
                    created_By: 1,
                    latitude: location.latitude,
                    longitude: location.longitude,
                }),
            }
        );

        const data = await response.text();
        console.log("Response:", data);

        if (!response.ok) {
            throw new Error(data);
        }

        setNewCourseName("");
        setPageMode("list");
        fetchCourses();
    } catch (err) {
        console.error("Create failed:", err);
        alert("Error creating course. Check console.");
    } finally {
        setCreateLoading(false);
    }
};

    // DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?"))
            return;

        // if(!locationEnabled){
        //     alert("Location access is required to delete a course");
        //     return;
        // }

        try {
            const response = await fetch(
                `${API_BASE_URL}/DeleteCourse/${id}`,
                { method: "POST" }
            );

            if (!response.ok) throw new Error("Delete failed");

            fetchCourses();
        } catch {
            alert("Error deleting course");
        }
    };

    // EDIT
    const handleEdit = (course) => {
        setSelectedCourse(course);
        setEditName(course.course_Name);
        setPageMode("edit");
    };


    const handleUpdate = async () => {
        if (!editName.trim()) {
            alert("Course name cannot be empty");
            return;
        }

         if(!locationEnabled){
            alert("Location access is required to edit a course");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/UpdateCourse/${selectedCourse.course_Id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        course_Id: selectedCourse.course_Id,
                        course_Name: editName,
                        modified_By: 1,
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }),
                }
            );

            if (!response.ok) throw new Error("Update failed");

            setShowEditModal(false);
            fetchCourses();
        } catch {
            alert("Error updating course");
        }
    };

    if (loading)
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        pageMode === "create" ?
            (<div className="container mt-4">
                <div className="d-flex mb-3">
                    <h3>Course Master</h3>
                </div>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <div className="w-50 mt-5">
                                <div className="relative">
                                    <input type="text" onChange={e => setNewCourseName(e.target.value)} id="small_outlined" className="border-2 block px-2.5 pb-1.5 pt-3 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " />
                                    <label htmlFor="small_outlined" className="absolute text-sm text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Course Name</label>
                                </div>
                            </div>
                            <button className="btn btn-primary mt-3" onClick={handleCreate}>Create Course</button>
                            <button className="btn btn-secondary mt-3" onClick={() => setPageMode("list")}>Go Back</button>
                        </div>
                    </div>
                </div>
            </div>) :
            pageMode === "edit" ?
                (<div className="container mt-4">
                    <div className="d-flex mb-3">
                        <h3>Edit Course</h3>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <div className="w-50 mt-5">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            id="edit_outlined"
                                            className="border-2 block px-2.5 pb-1.5 pt-3 w-full text-sm bg-transparent border rounded peer"
                                            placeholder=" "
                                        />
                                        <label
                                            htmlFor="edit_outlined"
                                            className="absolute text-sm duration-300 transform -translate-y-3 scale-75 top-1 bg-white px-2 peer-focus:scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2"
                                        >
                                            Course Name
                                        </label>
                                    </div>
                                </div>

                                <button className="btn btn-primary mt-3" onClick={handleUpdate}>
                                    Update Course
                                </button>

                                <button
                                    className="btn btn-secondary m-3"
                                    onClick={() => setPageMode("list")}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>) :
                (<div className="container mt-4">
                    <div className="d-flex justify-content-between mb-3">
                        <h3>Course Master</h3>

                        <div className="d-flex gap-2">
                        <input type="text" onChange={(e) => setSearchTerm(e.target.value)} id="floating_outlined" className="form-control" placeholder="Search Course" style={{ width: "250px" }} />
                    

                        <button
                            className="btn btn-primary"
                            onClick={() => setPageMode("create")}
                        >
                            + Create Course
                        </button>
                        </div>
                    </div>
                


                    <div className="card shadow-sm"><div className="card-body">
                        <table className="table table-hover text-center">
                            <thead className="table-secondary ">
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Course Name</th>
                                    <th width="200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length > 0 ? (
                                    currentCourses.map((course, index) => (
                                        <tr key={course.course_Id}>
                                            <td>{indexOfFirstCourse+index + 1}</td>
                                            <td>{course.course_Name}</td>
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm border btn-primary"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        ⋮
                                                    </button>

                                                    <ul className="dropdown-menu">
                                                        <li className="">
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleEdit(course)}
                                                            >
                                                                Edit
                                                            </button>
                                                        </li>
                                                        <li className="">
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDelete(course.course_Id)}
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
                                        <td colSpan="3">No courses found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                    </div></div>

                    {/* EDIT MODAL */}
                    {/* {showEditModal && (
                        <div className="modal show d-block" tabIndex="-1">
                            <div className="modal-dialog">
                                <div className="modal-content px-4">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Edit Course</h5>
                                        <button
                                            className="btn-close"
                                            onClick={() => setShowEditModal(false)}
                                        ></button>
                                    </div>
                                    <div class="relative">
                                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} id="small_outlined" class="block px-2.5 pb-1.5 pt-3 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " />
                                        <label for="small_outlined" class="absolute text-sm text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Course Name</label>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button className="btn btn-success" onClick={handleUpdate}>
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>)
    );
};
//
export default CourseMaster;
