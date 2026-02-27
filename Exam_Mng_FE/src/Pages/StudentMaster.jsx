import React, { useState } from 'react'

export const StudentMaster = () => {
    const [pageMode, setPageMode] = useState("view");
    const [searchTerm, setSearchTerm] = useState("");

    const API_BASE_URL = "https://localhost:7248/api/Student";
    return (
        <div className='container mt-4'>


            {pageMode === "create" ?
                (
                    <>
                        <div className='d-flex justify-content-between mb-3'>
                            <h3>Create Student</h3>
                        </div>
                    </>
                )

                : pageMode === "edit" ?
                    (
                        <>
                            <div className='d-flex justify-content-between mb-3'>
                                <h3>Edit Student</h3>
                            </div>
                        </>
                    )

                    :
                    (
                        <>
                            <div className='d-flex justify-content-between mb-3'>
                                <h3>Student Master</h3>
                                <div className="d-flex gap-2">
                                    <input type="text" onChange={(e) => setSearchTerm(e.target.value)} id="floating_outlined" className="form-control" placeholder="Search Course" style={{ width: "250px" }} />


                                    <button
                                        onChange={(e)=>setSearchTerm(e.target.value)}
                                        className="btn btn-primary"
                                        onClick={() => setPageMode("create")}
                                    >
                                        + Create Student
                                    </button>
                                </div>
                            </div>

                            <div className='card shadow-sm'>
                                <div className='card-body'>
                                    <table className='table table-hover text-center'>
                                        <thead className="table-secondary ">
                                            <tr>
                                                <th>Sr. No</th>
                                                <th>Image</th>
                                                <th>Student Name</th>
                                                <th>Course</th>
                                                <th>Email</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}


        </div>
    )
}
