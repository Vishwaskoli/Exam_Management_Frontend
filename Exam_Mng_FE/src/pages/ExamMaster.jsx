import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    const [isEditMode, setIsEditMode] = useState(false);
    const [mappedSubjects, setMappedSubjects] = useState([]);
    const [allMappings, setAllMappings] = useState([]); // all course-sem-subject mappings

    const [form, setForm] = useState({
        Exam_Id: null,
        Exam_Name: "",
        Course_Id: "",
        Sem_Id: "",
        Created_By: "",
        Modified_By: "",
        Latitude: "",
        Longitude: "",
        SubjectRows: [{ Subject_Id: "", Exam_Date: "", ExamStartTimes: "", Durations: "", ExamEndTime: "", Total_Marks: "" }],
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

    //commented from here
    // useEffect(() => {
    //     setForm((prev) => ({
    //         ...prev,
    //         Sem_Id: "",
    //         SubjectRows: prev.SubjectRows.map((r) => ({
    //             ...r,
    //             Subject_Id: "",
    //         })),
    //     }));
    // }, [form.Course_Id]);
    // to here

    useEffect(() => {
        if (!isEditMode) {
            setForm((prev) => ({
                ...prev,
                Sem_Id: "",
                SubjectRows: prev.SubjectRows.map((r) => ({
                    ...r,
                    Subject_Id: "",
                })),
            }));
        }
    }, [form.Course_Id]);

    useEffect(() => {
        if (form.Course_Id && form.Sem_Id) {

            const filtered = allMappings.filter(
                (m) =>
                    m.course_Id === parseInt(form.Course_Id) &&
                    m.sem_Id === parseInt(form.Sem_Id)
            );

            setMappedSubjects(filtered);

            //added this 
            if (!isEditMode) {
                //
                setForm((prev) => ({
                    ...prev,
                    SubjectRows: prev.SubjectRows.map((r) => ({
                        ...r,
                        Subject_Id: "",
                    })),
                }));
            }
        } else {
            setMappedSubjects([]);
        }
    }, [form.Course_Id, form.Sem_Id, allMappings]);

    // useEffect(() => {
    //     if (form.ExamStartTime && form.Duration) {
    //         const [hours, minutes] =
    //             form.ExamStartTime.split(":").map(Number);

    //         const totalMinutes =
    //             hours * 60 + minutes + parseInt(form.Duration);

    //         const endHours = Math.floor(totalMinutes / 60) % 24;
    //         const endMinutes = totalMinutes % 60;

    //         const formatted =
    //             String(endHours).padStart(2, "0") +
    //             ":" +
    //             String(endMinutes).padStart(2, "0");

    //         setForm(prev => ({
    //             ...prev,
    //             ExamEndTime: formatted
    //         }));
    //     }
    // }, [form.ExamStartTime, form.Duration]);


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


    const examStartTimes = form.SubjectRows.map(r => r.ExamStartTimes).join(",");
    const durations = form.SubjectRows.map(r => r.Durations).join(",");
    const examEndTimes = form.SubjectRows.map(r => r.ExamEndTime).join(",");

    // ---------------- FORM HANDLERS ----------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormChange = (e, idx) => {
        const { name, value } = e.target;

        setForm(prev => {
            const newRows = [...prev.SubjectRows];
            newRows[idx][name] = value;

            const start = newRows[idx].ExamStartTimes;
            const duration = newRows[idx].Durations;

            if (start && duration) {
                const [h, m] = start.split(":").map(Number);
                const totalMinutes = h * 60 + m + parseInt(duration);

                const endH = Math.floor(totalMinutes / 60) % 24;
                const endM = totalMinutes % 60;

                newRows[idx].ExamEndTime =
                    String(endH).padStart(2, "0") +
                    ":" +
                    String(endM).padStart(2, "0");
            }

            return { ...prev, SubjectRows: newRows };
        });
    };

    const addRow = () => {
        setForm((prev) => ({
            ...prev,
            SubjectRows: [...prev.SubjectRows, { Subject_Id: "", Exam_Date: "", ExamStartTimes: "", Durations: "", ExamEndTime: "", Total_Marks: "" }],
        }));
    };

    const removeRow = (idx) => {
        setForm((prev) => ({
            ...prev,
            SubjectRows: prev.SubjectRows.filter((_, i) => i !== idx),
        }));
    };

    const handleAdd = () => {
        setIsEditMode(false);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm({
                    Exam_Id: null,
                    Exam_Name: "",
                    Course_Id: "",
                    Sem_Id: "",
                    Created_By: "",
                    Modified_By: "",
                    Latitude: "",
                    Longitude: "",
                    SubjectRows: [{ Subject_Id: "", Exam_Date: "", ExamStartTimes: "", Durations: "", ExamEndTime: "", Total_Marks: "" }],
                });
                setView("add");
            },
            () => alert("Location permission is required.")
        );
    };

    const convertToDateInputFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    const calculateEndTime = (start, duration) => {
        if (!start || !duration) return "";

        const [h, m] = start.split(":").map(Number);
        const totalMinutes = h * 60 + m + parseInt(duration);

        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;

        return (
            String(endH).padStart(2, "0") +
            ":" +
            String(endM).padStart(2, "0")
        );
    };

    const handleView = (exam) => {

        setIsEditMode(false);

        const subjectIds = exam.subjectIds ? exam.subjectIds.split(",") : [];
        const examDates = exam.examDates ? exam.examDates.split(",") : [];
        const totalMarks = exam.totalMarks ? exam.totalMarks.split(",") : [];
        const examStartTimes = exam.examStartTimes ? exam.examStartTimes.split(",") : [];
        const durations = exam.durations ? exam.durations.split(",") : [];
        const examEndTimes = exam.examEndTimes ? exam.examEndTimes.split(",") : [];

        const subjectRows = subjectIds.map((subId, index) => {

            const start = examStartTimes[index] || "";
            const duration = durations[index] || "";

            return {
                Subject_Id: String(subId),
                Exam_Date: examDates[index] || "",
                ExamStartTimes: start,
                Durations: duration,
                ExamEndTime: calculateEndTime(start, duration),
                Total_Marks: totalMarks[index] || "",
            };
        });

        const filteredMappedSubjects = allMappings.filter(
            (m) =>
                m.course_Id === parseInt(exam.course_Id) &&
                m.sem_Id === parseInt(exam.sem_Id)
        );

        setMappedSubjects(filteredMappedSubjects);

        setForm({
            Exam_Id: exam.exam_Id,
            Exam_Name: exam.exam_Name,
            Course_Id: String(exam.course_Id),
            Sem_Id: String(exam.sem_Id),
            Created_By: exam.created_By,
            Modified_By: exam.modified_By,
            SubjectRows:
                subjectRows.length > 0
                    ? subjectRows
                    : [{ Subject_Id: "", Exam_Date: "", ExamStartTimes: "", Durations: "", ExamEndTime: "", Total_Marks: "" }],
        });

        setView("view"); // 👈 IMPORTANT
    };

    const handleEdit = (exam) => {

        setIsEditMode(true);

        // Split aggregated values
        const subjectIds = exam.subjectIds ? exam.subjectIds.split(",") : [];
        const examDates = exam.examDates ? exam.examDates.split(",") : [];
        const totalMarks = exam.totalMarks ? exam.totalMarks.split(",") : [];

        const examStartTimes = exam.examStartTimes ? exam.examStartTimes.split(",") : [];
        const durations = exam.durations ? exam.durations.split(",") : [];

        // Build subject rows
        const subjectRows = subjectIds.map((subId, index) => {

            const start = examStartTimes[index] || "";
            const duration = durations[index] || "";

            return {
                Subject_Id: String(subId),
                Exam_Date: examDates[index] || "",
                ExamStartTimes: start,
                Durations: duration,
                ExamEndTime: calculateEndTime(start, duration),
                Total_Marks: totalMarks[index] || "",
            };
        });

        // Filter dropdown subjects
        const filteredMappedSubjects = allMappings.filter(
            (m) =>
                m.course_Id === parseInt(exam.course_Id) &&
                m.sem_Id === parseInt(exam.sem_Id)
        );

        setMappedSubjects(filteredMappedSubjects);


        setForm({
            Exam_Id: exam.exam_Id,
            Exam_Name: exam.exam_Name,
            Course_Id: String(exam.course_Id),
            Sem_Id: String(exam.sem_Id),
            Created_By: exam.created_By,
            Modified_By: "",
            SubjectRows:
                subjectRows.length > 0
                    ? subjectRows
                    : [{ Subject_Id: "", Exam_Date: "", ExamStartTimes: "", Durations: "", ExamEndTime: "", Total_Marks: "" }],
        });

        setView("edit");
    };

    const handleSave = async () => {

        if (!form.Exam_Name || !form.Course_Id || !form.Sem_Id) {
            alert("Exam Name, Course and Semester are required");
            return;
        }

        if (view === "add" && !form.Created_By) {
            alert("Created By is required");
            return;
        }

        if (view === "edit" && !form.Modified_By) {
            alert("Modified By is required");
            return;
        }

        for (let row of form.SubjectRows) {
            if (!row.Subject_Id || !row.Exam_Date || !row.Total_Marks) {
                alert("All Subject rows must be filled");
                return;
            }
        }

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // ✅ User allowed location
                const latitude = position.coords.latitude.toFixed(14);
                const longitude = position.coords.longitude.toFixed(14);

                try {

                    // 🔥 Convert rows into comma separated values
                    const subjectIds = form.SubjectRows.map(r => r.Subject_Id).join(",");
                    const examDates = form.SubjectRows.map(r => r.Exam_Date).join(",");
                    const totalMarks = form.SubjectRows.map(r => r.Total_Marks).join(",");

                    const payload = {
                        mode: view === "edit" ? "Update" : "Add",
                        exam_Id: form.Exam_Id,
                        exam_Name: form.Exam_Name,
                        course_Id: parseInt(form.Course_Id),
                        sem_Id: parseInt(form.Sem_Id),
                        subjectIds: subjectIds,
                        examDates: examDates,
                        examStartTimes: examStartTimes,
                        durations: durations,
                        totalMarks: totalMarks,
                        created_By: view === "add" ? parseInt(form.Created_By) : null,
                        modified_By: view === "edit" ? parseInt(form.Modified_By) : null,
                        latitude: latitude ? parseFloat(latitude) : 0,
                        longitude: longitude ? parseFloat(longitude) : 0,
                    };

                    await axios.post(API_BASE_URL, payload);

                    fetchExams();
                    setView("list");

                    alert(view === "edit"
                        ? "Exam updated successfully!"
                        : "Exam saved successfully!"
                    );

                    console.log("Latitude: " + latitude);
                    console.log("Longitude: " + longitude);
                    console.log("Payload:", payload);

                } catch (err) {
                    console.error("Error saving exam", err);

                    const message =
                        err.response?.data?.message
                    //err.response?.data 
                    //err.message;

                    alert(message);
                }
            },
            (error) => {
                // ❌ User denied location
                alert("Location access is required to add or edit an exam.");
            }
        );
    };

    // const handleSave = async () => {

    //     // ✅ Basic Validation
    //     if (!form.Exam_Name || !form.Course_Id || !form.Sem_Id) {
    //         alert("Exam Name, Course and Semester are required");
    //         return;
    //     }

    //     if (view === "add" && !form.Created_By) {
    //         alert("Created By is required");
    //         return;
    //     }

    //     if (view === "edit" && !form.Modified_By) {
    //         alert("Modified By is required");
    //         return;
    //     }

    //     // ✅ Subject Row Validation
    //     for (let row of form.SubjectRows) {
    //         if (!row.Subject_Id || !row.Exam_Date || !row.Total_Marks) {
    //             alert("All Subject rows must be filled");
    //             return;
    //         }
    //     }

    //     // ✅ Duplicate Subject Check
    //     const subjectIds = form.SubjectRows.map((r) => r.Subject_Id);
    //     const duplicates = subjectIds.filter(
    //         (item, index) => subjectIds.indexOf(item) !== index
    //     );

    //     if (duplicates.length > 0) {
    //         alert("Duplicate subjects are not allowed.");
    //         return;
    //     }

    //     try {

    //         // 🔥 1️⃣ IF EDIT → Delete all old rows first
    //         if (view === "edit") {

    //             const relatedRows = exams.filter(
    //                 (e) =>
    //                     e.exam_Name === form.Exam_Name &&
    //                     e.course_Id === form.Course_Id &&
    //                     e.sem_Id === form.Sem_Id
    //             );

    //             for (let row of relatedRows) {
    //                 await axios.post(API_BASE_URL,payload, {
    //                     Exam_Id: row.exam_Id,
    //                     Modified_By: parseInt(form.Modified_By),
    //                 });
    //             }
    //         }

    //         // 🔥 2️⃣ Insert rows one by one
    //         for (let row of form.SubjectRows) {

    //             const payload = {
    //                 Mode: "Add",
    //                 Exam_Id: 0,
    //                 Exam_Name: form.Exam_Name,
    //                 Course_Id: parseInt(form.Course_Id),
    //                 Sem_Id: parseInt(form.Sem_Id),
    //                 SubjectIds: row.Subject_Id,
    //                 ExamDates: row.Exam_Date,
    //                 TotalMarks: row.Total_Marks,
    //                 Created_By: view === "add"
    //                     ? parseInt(form.Created_By)
    //                     : parseInt(form.Modified_By),
    //             };

    //             await axios.post(API_BASE_URL, payload);
    //         }

    //         fetchExams();
    //         setView("list");
    //         alert(view === "edit"
    //             ? "Exam updated successfully!"
    //             : "Exam saved successfully!"
    //         );

    //     } catch (err) {
    //         console.error("Error saving exam", err);
    //         alert("Error saving exam.");
    //     }
    // };

    const handleDelete = async (examId) => {
        const modifiedBy = prompt("Enter your User ID for deletion:");
        if (!modifiedBy) return;

        try {
            await axios.post(`${API_BASE_URL}/delete`, {
                Exam_Id: examId,
                Modified_By: parseInt(modifiedBy),
            });
            fetchExams();
            alert("Exam deleted successfully!");
        } catch (err) {
            console.error("Error deleting exam", err);
            alert("Error deleting exam. See console.");
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Exam Details", 14, 15);

        doc.setFontSize(12);
        doc.text(`Exam Name: ${form.Exam_Name}`, 14, 30);
        doc.text(`Course: ${courseMap[Number(form.Course_Id)]}`, 14, 38);
        doc.text(`Semester: ${semesterMap[Number(form.Sem_Id)]}`, 14, 46);

        // ✅ Prepare table data with new fields
        const tableData = form.SubjectRows.map((row, index) => [
            index + 1,
            subjectMap[Number(row.Subject_Id)] || "",
            row.Exam_Date,
            row.ExamStartTimes || "",
            row.Durations || "",
            row.ExamEndTime || "",
            row.Total_Marks
        ]);

        autoTable(doc, {
            startY: 55,
            head: [[
                "Serial Number",
                "Subject",
                "Exam Date",
                "Start Time",
                "Duration (Minutes)",
                "End Time",
                "Total Marks"
            ]],
            body: tableData,
            styles: { fontSize: 10 },   // optional for better fit
        });

        doc.save(`${form.Exam_Name}_Exam.pdf`);
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(14);
                const long = position.coords.longitude.toFixed(14);

                setForm(prev => ({
                    ...prev,
                    Latitude: lat,
                    Longitude: long
                }));
            },
            (error) => {
                alert("Location permission is required.");
                console.error(error);
            }
        );
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

    // const filteredSemesters =
    // view === "edit"
    //     ? allSemesters
    //     : form.Course_Id
    //         ? allSemesters.filter((sem) =>
    //             allMappings.some(
    //                 (m) =>
    //                     m.course_Id === parseInt(form.Course_Id) &&
    //                     m.sem_Id === sem.sem_Id
    //             )
    //         )
    //         : [];

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
        <div className="container mt-4" style={{ paddingTop: "100px" }}>
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
                                style={{ width: "250px" }}
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
                                        <th>Serial Number</th>
                                        <th>Exam Name</th>
                                        <th>Course</th>
                                        <th>Semester</th>
                                        <th style={{ width: "80px" }}>Action</th>
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
                                                                    onClick={() => handleView(exam)}
                                                                >
                                                                    View
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => handleEdit(exam)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </li>

                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => handleDelete(exam.exam_Id)}
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

            {/* ADD / EDIT / VIEW/ VIEW */}
            {(view === "add" || view === "edit" || view === "view") && (
                <div className="card shadow-sm p-4 mt-3">
                    <h4>{view === "edit" ? "Edit Exam" : view === "view" ? "View Exam" : "Add Exam"}</h4>

                    <div className="mb-3">
                        <label>Exam Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Exam_Name"
                            value={form.Exam_Name}
                            onChange={handleInputChange}
                            disabled={view === "view"}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Course</label>
                        <select className="form-select" name="Course_Id" value={form.Course_Id} onChange={handleInputChange} disabled={view === "view"}>
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
                        <select className="form-select" name="Sem_Id" value={form.Sem_Id} onChange={handleInputChange} disabled={view === "view"}>
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
                            disabled={view === "view"}
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
                                disabled={view === "view"}
                            >
                                <option value="">Select Subject</option>

                                {mappedSubjects.map((m) => (
                                    <option key={m.sub_Sem_Map_Id} value={m.sub_Id}>
                                        {subjectMap[Number(m.sub_Id)] || "N/A"}
                                    </option>
                                ))}
                            </select>

                            <input type="date" className="form-control" name="Exam_Date" value={row.Exam_Date} onChange={(e) => handleFormChange(e, idx)} disabled={view === "view"} />
                            {/* <div>
                                <label>Start Time</label> */}
                            <input
                                type="time"
                                className="form-control"
                                name="ExamStartTimes"
                                value={row.ExamStartTimes}
                                onChange={(e) => handleFormChange(e, idx)}
                                disabled={view === "view"}
                            />
                            {/* </div> */}

                            {/* <div>
                                <label>Duration (Minutes)</label> */}
                            <input
                                type="number"
                                className="form-control"
                                name="Durations"
                                value={row.Durations}
                                onChange={(e) => handleFormChange(e, idx)}
                                disabled={view === "view"}
                            />
                            {/* </div> */}

                            {/* <div>
                                <label>End Time (Auto)</label> */}
                            <input
                                type="time"
                                className="form-control"
                                value={row.ExamEndTime}
                                disabled={view === "view"}
                            />
                            {/* </div> */}
                            <input type="number" className="form-control" placeholder="Marks" name="Total_Marks" value={row.Total_Marks} onChange={(e) => handleFormChange(e, idx)} disabled={view === "view"} />

                            <button className="btn btn-danger" onClick={() => removeRow(idx)} disabled={view === "view"}>
                                Delete
                            </button>
                        </div>
                    ))}

                    <button className="btn btn-secondary mb-3" onClick={addRow} disabled={view === "view"}>
                        + Add Row
                    </button>

                    <div className="d-flex gap-2">
                        <button className="btn btn-secondary" onClick={() => setView("list")}>
                            Back
                        </button>

                        {view === "view" && (
                            <button className="btn btn-success" onClick={handleExportPDF}>
                                Export to PDF
                            </button>
                        )}

                        {view !== "view" && (
                            <button className="btn btn-primary" onClick={handleSave}>
                                {view === "edit" ? "Update" : "Save"}
                            </button>
                        )}
                    </div>

                    {/* <div className="d-flex gap-2">
                        <button className="btn btn-secondary" onClick={() => setView("list")}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={view === "view"}>
                            {view === "edit" ? "Update" : "Save"}
                        </button>
                    </div> */}
                </div>
            )}
        </div>
    );
};

export default ExamMaster;