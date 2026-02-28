import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = "https://localhost:7248/api/ExamMaster";
const API_SUBJECT_MAPPING = "https://localhost:7248/api/SubjectSemMapping";
const API_COURSES = "https://localhost:7248/api/CourseMaster";
const API_SEMESTERS = "https://localhost:7248/api/SemesterMaster";
const API_SUBJECTS = "https://localhost:7248/api/SubjectMaster";

const ExamMaster = () => {
    const [exams, setExams] = useState([]);
    const [view, setView] = useState("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [allSemesters, setAllSemesters] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [courses, setCourses] = useState([]);

    const [mappedSubjects, setMappedSubjects] = useState([]);
    const [allMappings, setAllMappings] = useState([]); // all course-sem-subject mappings

    const [form, setForm] = useState({
        Exam_Id: null,
        Exam_Name: "",
        Course_Id: "",
        Sem_Id: "",
        Created_By: "",
        Modified_By: "",
        SubjectRows: [{ Subject_Id: "", Exam_Date: "", Total_Marks: "" }],
    });

    // ---------------- FETCH DATA ----------------
    // Build a global semester map from allMappings
    // Only build map if allMappings exists and has length
    // const globalSemesterMap =
    // Array.isArray(allMappings) && allMappings.length > 0
    //     ? Object.fromEntries(
    //           [
    //               ...new Map(
    //                   allMappings
    //                       .filter((m) => m && m.sem_Id != null)
    //                       .map((m) => [Number(m.sem_Id), m.sem_Name])
    //               )
    //           ]
    //       )
    //     : {};

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(API_SUBJECTS);
            console.log("Subjects fetched:", res.data);
            setAllSubjects(res.data);
            console.log("MappedSubjects:", mappedSubjects);
            console.log("AllSubjects:", allSubjects);
        } catch (err) {
            console.error("Error fetching subjects", err);
        }
    };

    const fetchSemesters = async () => {
        try {
            const res = await axios.get(API_SEMESTERS);
            // console.log("Semesters fetched:", res.data);
            setAllSemesters(res.data);
        } catch (err) {
            console.error("Error fetching semesters", err);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await axios.get(API_BASE_URL);
            // console.log("Exams fetched:", res.data);
            setExams(res.data);
        } catch (err) {
            console.error("Error fetching exams", err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(API_COURSES);
            setCourses(res.data);
        } catch (err) {
            console.error("Error fetching courses", err);
        }
    };

    const fetchAllMappings = async () => {
        try {
            const res = await axios.get(API_SUBJECT_MAPPING);
            console.log("All mappings fetched:", res.data);
            setAllMappings(res.data);
        } catch (err) {
            console.error("Error fetching subject-semester mappings", err);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchCourses();
        fetchAllMappings();
        fetchSemesters();
        fetchSubjects();
    }, []);

    // ---------------- DEPENDENT DROPDOWNS ----------------
    // Update semesters when course changes

    //commented from here
    // useEffect(() => {
    //     if (!form.Course_Id) {
    //         setMappedSubjects([]);
    //         return;
    //     }

    //     const semestersForCourse = Array.from(
    //         new Map(
    //             allMappings
    //                 .filter((m) => m.course_Id === parseInt(form.Course_Id))
    //                 .map((s) => [s.sem_Id, { sem_Id: s.sem_Id, sem_Name: s.sem_Name }])
    //         ).values()
    //     );
    //     // console.log("Semesters for course", form.Course_Id, semestersForCourse);
    //     // setSemesters(semestersForCourse);

    //     // Reset semester and subject rows
    //     setForm((prev) => ({
    //         ...prev,
    //         Sem_Id: "",
    //         SubjectRows: prev.SubjectRows.map((r) => ({ ...r, Subject_Id: "" })),
    //     }));
    // }, [form.Course_Id, allMappings]);
    // to here

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            Sem_Id: "",
            SubjectRows: prev.SubjectRows.map((r) => ({
                ...r,
                Subject_Id: "",
            })),
        }));
    }, [form.Course_Id]);

    useEffect(() => {
        if (form.Course_Id && form.Sem_Id) {

            const filtered = allMappings.filter(
                (m) =>
                    m.course_Id === parseInt(form.Course_Id) &&
                    m.sem_Id === parseInt(form.Sem_Id)
            );

            setMappedSubjects(filtered);

            setForm((prev) => ({
                ...prev,
                SubjectRows: prev.SubjectRows.map((r) => ({
                    ...r,
                    Subject_Id: "",
                })),
            }));
        } else {
            setMappedSubjects([]);
        }
    }, [form.Course_Id, form.Sem_Id, allMappings]);


    // Update subjects when course or semester changes
    //commented from here
    // useEffect(() => {
    //     if (form.Course_Id && form.Sem_Id) {
    //         const subjects = allMappings.filter(
    //             (m) =>
    //                 m.course_Id === parseInt(form.Course_Id) &&
    //                 m.sem_Id === parseInt(form.Sem_Id)
    //         );
    //         setMappedSubjects(subjects);

    //         // Reset subject rows
    //         setForm((prev) => ({
    //             ...prev,
    //             SubjectRows: prev.SubjectRows.map((r) => ({ ...r, Subject_Id: "" })),
    //         }));
    //     } else {
    //         setMappedSubjects([]);
    //     }
    // }, [form.Course_Id, form.Sem_Id, allMappings]);
    // to here


    // ---------------- FORM HANDLERS ----------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormChange = (e, idx) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const newRows = [...prev.SubjectRows];
            newRows[idx][name] = value;
            return { ...prev, SubjectRows: newRows };
        });
    };

    const addRow = () => {
        setForm((prev) => ({
            ...prev,
            SubjectRows: [...prev.SubjectRows, { Subject_Id: "", Exam_Date: "", Total_Marks: "" }],
        }));
    };

    const removeRow = (idx) => {
        setForm((prev) => ({
            ...prev,
            SubjectRows: prev.SubjectRows.filter((_, i) => i !== idx),
        }));
    };

    const handleAdd = () => {
        setForm({
            Exam_Id: null,
            Exam_Name: "",
            Course_Id: "",
            Sem_Id: "",
            Created_By: "",
            Modified_By: "",
            SubjectRows: [{ Subject_Id: "", Exam_Date: "", Total_Marks: "" }],
        });
        setView("add");
    };

    const handleEdit = (exam) => {
        const subjectIds = exam.subjectIds ? exam.subjectIds.split(",") : [];
        const examDates = exam.examDates ? exam.examDates.split(",") : [];
        const totalMarks = exam.totalMarks ? exam.totalMarks.split(",") : [];

        const subjectRows = subjectIds.map((subId, idx) => ({
            Subject_Id: subId,
            Exam_Date: examDates[idx] || "",
            Total_Marks: totalMarks[idx] || "",
        }));

        const filteredMappedSubjects = allMappings.filter(
            (m) => m.course_Id === parseInt(exam.course_Id) && m.sem_Id === parseInt(exam.sem_Id)
        );
        setMappedSubjects(filteredMappedSubjects);

        setForm({
            Exam_Id: exam.exam_Id,
            Exam_Name: exam.exam_Name,
            Course_Id: exam.course_Id,
            Sem_Id: exam.sem_Id,
            Created_By: exam.created_By,
            Modified_By: "",
            SubjectRows: subjectRows.length
                ? subjectRows
                : [{ Subject_Id: "", Exam_Date: "", Total_Marks: "" }],
        });
        setView("edit");
    };

    const handleSave = async () => {
        if (!form.Exam_Name || !form.Course_Id || !form.Sem_Id || !form.Created_By) {
            alert("Exam Name, Course, Semester, and Created By are required");
            return;
        }

        for (let row of form.SubjectRows) {
            if (!row.Subject_Id || !row.Exam_Date || !row.Total_Marks) {
                alert("All Subject rows must be filled");
                return;
            }
        }

        const subjectIds = form.SubjectRows.map((r) => r.Subject_Id);
        const duplicates = subjectIds.filter((item, index) => subjectIds.indexOf(item) !== index);

        if (duplicates.length > 0) {
            alert("Duplicate subjects are not allowed. Please select unique subjects.");
            return;
        }

        const payload = {
            Mode: view === "edit" ? "Update" : "Add",
            Exam_Id: form.Exam_Id,
            Exam_Name: form.Exam_Name,
            Course_Id: parseInt(form.Course_Id),
            Sem_Id: parseInt(form.Sem_Id),
            SubjectIds: form.SubjectRows.map((r) => r.Subject_Id).join(","),
            ExamDates: form.SubjectRows.map((r) => r.Exam_Date).join(","),
            TotalMarks: form.SubjectRows.map((r) => r.Total_Marks).join(","),
            Created_By: form.Created_By ? parseInt(form.Created_By) : null,
            Modified_By: form.Modified_By ? parseInt(form.Modified_By) : null,
        };

        try {
            await axios.post(API_BASE_URL, payload);
            fetchExams();
            setView("list");
            alert("Exam saved successfully!");
        } catch (err) {
            console.error("Error saving exam", err);
            alert("Error saving exam. Check console.");
        }
    };

    const handleDelete = async (examId) => {
        const modifiedBy = prompt("Enter your User ID for deletion:");
        if (!modifiedBy) return;

        try {
            await axios.post(`${API_BASE_URL}/delete`, {
                Exam_Id: examId,
                Modified_By: parseInt(modifiedBy),
            });
            fetchExams();
        } catch (err) {
            console.error("Error deleting exam", err);
            alert("Error deleting exam. See console.");
        }
    };

    // ---------------- RENDER ----------------
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;

    // Only unique exam names
    const uniqueExams = Array.from(
        new Map(exams.map((e) => [e.exam_Name.toLowerCase(), e])).values()
    );

    const filteredExams = uniqueExams.filter((e) =>
        e.exam_Name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentExams = filteredExams.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const courseMap = Object.fromEntries(courses.map((c) => [Number(c.course_Id), c.course_Name]));
    const semesterMap = Object.fromEntries(allSemesters.map((s) => [Number(s.sem_Id), s.sem_Name]));

    // console.log("semesterMap:", semesterMap);

    const filteredSemesters =
        form.Course_Id
            ? allSemesters.filter((sem) =>
                allMappings.some(
                    (m) =>
                        m.course_Id === parseInt(form.Course_Id) &&
                        m.sem_Id === sem.sem_Id
                )
            )
            : [];

    const subjectMap = Object.fromEntries(
        allSubjects.map((s) => [Number(s.subject_Id), s.subject_Name])
    );

    return (
        <div className="container mt-4">
            {/* LIST VIEW */}
            {view === "list" && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Exam Master</h3>
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search exam..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleAdd}>
                                + Add Exam
                            </button>
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Exam Name</th>
                                        <th>Course</th>
                                        <th>Semester</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentExams.length > 0 ? (
                                        currentExams.map((exam, idx) => (
                                            <tr key={exam.exam_Id}>
                                                <td>{indexOfFirst + idx + 1}</td>
                                                <td>{exam.exam_Name}</td>
                                                <td>{courseMap[Number(exam.course_Id)] || "N/A"}</td>
                                                <td>{semesterMap[Number(exam.sem_Id)] || "N/A"}</td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleEdit(exam)}>
                                                            Edit
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exam.exam_Id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="d-flex justify-content-between">
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
            {(view === "add" || view === "edit") && (
                <div className="card shadow-sm p-4 mt-3">
                    <h4>{view === "edit" ? "Edit Exam" : "Add Exam"}</h4>

                    <div className="mb-3">
                        <label>Exam Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Exam_Name"
                            value={form.Exam_Name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Course</label>
                        <select className="form-select" name="Course_Id" value={form.Course_Id} onChange={handleInputChange}>
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c.course_Id} value={c.course_Id}>
                                    {c.course_Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label>Semester</label>
                        <select className="form-select" name="Sem_Id" value={form.Sem_Id} onChange={handleInputChange}>
                            <option value="">Select Semester</option>
                            {filteredSemesters.map((s) => (
                                <option key={s.sem_Id} value={s.sem_Id}>
                                    {s.sem_Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label>{view === "edit" ? "Modified By" : "Created By"} (User ID)</label>
                        <input
                            type="number"
                            className="form-control"
                            name={view === "edit" ? "Modified_By" : "Created_By"}
                            value={view === "edit" ? form.Modified_By : form.Created_By}
                            onChange={handleInputChange}
                        />
                    </div>

                    <hr />
                    <h5>Subjects</h5>
                    {form.SubjectRows.map((row, idx) => (
                        <div key={idx} className="d-flex gap-2 mb-2">
                            <select
                                className="form-select"
                                name="Subject_Id"
                                value={row.Subject_Id}
                                onChange={(e) => handleFormChange(e, idx)}
                            >
                                <option value="">Select Subject</option>

                                {mappedSubjects.map((m) => (
                                    <option key={m.sub_Sem_Map_Id} value={m.sub_Id}>
                                        {subjectMap[Number(m.sub_Id)] || "N/A"}
                                    </option>
                                ))}
                            </select>

                            <input type="date" className="form-control" name="Exam_Date" value={row.Exam_Date} onChange={(e) => handleFormChange(e, idx)} />
                            <input type="number" className="form-control" placeholder="Marks" name="Total_Marks" value={row.Total_Marks} onChange={(e) => handleFormChange(e, idx)} />

                            <button className="btn btn-danger" onClick={() => removeRow(idx)}>
                                Delete
                            </button>
                        </div>
                    ))}

                    <button className="btn btn-secondary mb-3" onClick={addRow}>
                        + Add Row
                    </button>

                    <div className="d-flex gap-2">
                        <button className="btn btn-secondary" onClick={() => setView("list")}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {view === "edit" ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamMaster;