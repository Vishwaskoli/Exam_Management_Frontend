import React, { useEffect, useState, useMemo } from "react";
import {
  getResults,
  saveResult,
  deleteResult,
} from "../services/resultService";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://localhost:7248/api";

const initialFormState = {
  resultId: 0,
  courseId: "",
  semId: "",
  examId: "",
  studentId: "",
  subjectId: "",
  obtainedMarks: "",
  totalMarks: "",
  longitude: null,
  latitude: null,
  createdBy: 1,
  modifiedBy: 1,
};

const getLocation = () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      setForm((prev) => ({
        ...prev,
        latitude: latitude,
        longitude: longitude,
      }));

      toast.success("Location captured ✅");
    },
    (error) => {
      console.error(error);
      toast.error("Location permission denied ❌");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

const Result = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState(initialFormState);
  const [pageMode, setPageMode] = useState("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const res = await getResults();
      setResults(res.data);

      const courseRes = await axios.get(
        `${API_BASE}/CourseMaster/ActiveCourses`
      );
      setCourses(courseRes.data);
    } catch {
      toast.error("Failed to load data");
    }
  };

  // ================= RESET FORM PROPERLY =================
  const resetForm = () => {
    setForm(initialFormState);
    setSemesters([]);
    setExams([]);
    setStudents([]);
    setSubjects([]);
  };

  // ================= CASCADING LOADERS =================

  const loadSemestersAndStudents = async (courseId) => {
    if (!courseId) return;

    const semRes = await axios.get(
      `${API_BASE}/SemesterMaster/ByCourse/${courseId}`
    );
    setSemesters(semRes.data);

    const stuRes = await axios.get(`${API_BASE}/Student`);
    const filtered = stuRes.data.filter(
      (s) => s.courseId == parseInt(courseId)
    );
    setStudents(filtered);
  };

  const loadExamsAndSubjects = async (courseId, semId) => {
    if (!courseId || !semId) return;

    const examRes = await axios.get(
      `${API_BASE}/ExamMaster/GetByCourseSem?courseId=${courseId}&semId=${semId}`
    );
    setExams(examRes.data);

    const subRes = await axios.get(
      `${API_BASE}/SubjectSemMapping/GetSubjects?courseId=${courseId}&semId=${semId}`
    );
    setSubjects(subRes.data);
  };

  const handleCourseChange = async (courseId) => {
    resetForm();
    setForm((prev) => ({ ...prev, courseId }));
    await loadSemestersAndStudents(courseId);
  };

  const handleSemesterChange = async (semId) => {
  const courseId = form.courseId;

  setForm((prev) => ({
    ...prev,
    semId,
    examId: "",
    subjectId: "",
  }));

  await loadExamsAndSubjects(courseId, semId);
};

  const handleExamChange = async (examId) => {
    const res = await axios.get(
      `${API_BASE}/ExamMaster/GetTotalMarks/${examId}`
    );
    setForm((prev) => ({
      ...prev,
      examId,
      totalMarks: res.data.totalMarks,
    }));
  };

  // ================= EDIT FIXED =================
  const handleEdit = async (row) => {
  console.log("Edit row:", row);

  resetForm();

  try {
    // 1️⃣ Load semesters + students
    await loadSemestersAndStudents(row.courseId);

    // 2️⃣ Load exams + subjects
    await loadExamsAndSubjects(row.courseId, row.semId);

    // 3️⃣ Now set form AFTER options are loaded
    setForm({
  resultId: row.resultId,
  courseId: String(row.courseId),
  semId: String(row.semId),
  examId: String(row.examId),
  studentId: String(row.studentId),
  subjectId: String(row.subjectId),
  obtainedMarks: row.obtainedMarks,
  totalMarks: row.totalMarks,
  createdBy: 1,
  modifiedBy: 1,
});

    setPageMode("edit");
  } catch (err) {
    console.error(err);
    toast.error("Failed to load edit data");
  }
};

  // ================= SAVE =================
 const handleSave = async () => {
  try {
    // If location not captured yet, get it first
    if (!form.latitude || !form.longitude) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setForm((prev) => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
            resolve();
          },
          () => {
            toast.error("Location required");
            resolve();
          }
        );
      });
    }

    await saveResult({
      ...form,
      courseId: parseInt(form.courseId),
      semId: parseInt(form.semId),
      examId: parseInt(form.examId),
      studentId: parseInt(form.studentId),
      subjectId: parseInt(form.subjectId),
      longitude: form.longitude,
      latitude: form.latitude,
    });

    toast.success(pageMode === "edit" ? "Updated 🎉" : "Saved 🎉");

    resetForm();
    setPageMode("list");
    loadInitialData();
  } catch (err) {
    toast.error("Save failed");
  }
};

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    await deleteResult({ resultId: id, modifiedBy: 1 });
    toast.success("Deleted");
    loadInitialData();
  };

  // ================= SEARCH =================
  const filteredResults = useMemo(() => {
    return results.filter((r) =>
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredResults.length / pageSize);

  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ================= EXCEL EXPORT =================
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([buffer]), "Results.xlsx");
  };

  // ================= ALL PDF EXPORT =================
  const exportAllPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Student", "Exam", "Marks"]],
      body: filteredResults.map((r) => [
        r.studentName,
        r.examName,
        `${r.obtainedMarks}/${r.totalMarks}`,
      ]),
    });

    doc.save("All_Results.pdf");
  };

  // ================= INDIVIDUAL PDF =================
  const exportStudentPDF = (r) => {
    const doc = new jsPDF();
    const percent = (
      (r.obtainedMarks / r.totalMarks) *
      100
    ).toFixed(1);

    doc.text("Student Result Report", 14, 20);
    doc.text(`Student: ${r.studentName}`, 14, 40);
    doc.text(`Exam: ${r.examName}`, 14, 50);
    doc.text(`Marks: ${r.obtainedMarks}/${r.totalMarks}`, 14, 60);
    doc.text(`Percentage: ${percent}%`, 14, 70);

    doc.save(`${r.studentName}_Report.pdf`);
  };

  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>
      <ToastContainer autoClose={2000} />

      {/* ================= LIST ================= */}
      {pageMode === "list" && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h3>Result Master</h3>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => {
                  resetForm();
                  setPageMode("create");
                }}
              >
                + Add
              </button>
              <button
                className="btn btn-outline-success me-2"
                onClick={exportToExcel}
              >
                Excel
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={exportAllPDF}
              >
                PDF
              </button>
            </div>
          </div>

          <input
            className="form-control mb-3"
            placeholder="Search Student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="card shadow">
            <div className="card-body">
              <table className="table table-bordered text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((r) => (
                    <tr key={r.resultId}>
                      <td>{r.studentName}</td>
                      <td>{r.examName}</td>
                      <td>
                        {r.obtainedMarks}/{r.totalMarks}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => exportStudentPDF(r)}
                        >
                          PDF
                        </button>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(r.resultId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-center mt-3">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm mx-1 ${
                      currentPage === index + 1
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= FORM ================= */}
      {(pageMode === "create" || pageMode === "edit") && (
        <div className="card shadow p-4">
          <h4>{pageMode === "edit" ? "Edit Result" : "Add Result"}</h4>

          {/* Course */}
          <select
            className="form-select mb-2"
            value={form.courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.course_Id} value={String(c.course_Id)}>
                {c.course_Name}
              </option>
            ))}
          </select>

          {/* Semester */}
          <select
            className="form-select mb-2"
            value={form.semId}
            onChange={(e) => handleSemesterChange(e.target.value)}
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.sem_Id} value={String(s.sem_Id)}>
                {s.sem_Name}
              </option>
            ))}
          </select>

          {/* Exam */}
          <select
            className="form-select mb-2"
            value={form.examId}
            onChange={(e) => handleExamChange(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map((ex) => (
              <option key={ex.exam_Id} value={String(ex.exam_Id)}>
                {ex.exam_Name}
              </option>
            ))}
          </select>

          {/* Student */}
          <select
            className="form-select mb-2"
            value={form.studentId}
            onChange={(e) =>
              setForm({ ...form, studentId: e.target.value })
            }
          >
            <option value="">Select Student</option>
            {students.map((st) => (
              <option key={st.student_Id} value={String(st.student_Id)}>
                {st.stu_FirstName +
                  " " +
                  (st.stu_LastName ?? "")}
              </option>
            ))}
          </select>

          {/* Subject */}
          <select
            className="form-select mb-2"
            value={form.subjectId}
            onChange={(e) =>
              setForm({ ...form, subjectId: e.target.value })
            }
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.sub_Id} value={String(sub.sub_Id)}>
                {sub.subject_Name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="form-control mb-2"
            placeholder="Obtained Marks"
            value={form.obtainedMarks}
            onChange={(e) =>
              setForm({
                ...form,
                obtainedMarks: e.target.value,
              })
            }
          />

          <input
            type="number"
            className="form-control mb-3"
            value={form.totalMarks}
            disabled
          />

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                resetForm();
                setPageMode("list");
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {pageMode === "edit" ? "Update" : "Save"}
            </button>
            <button
  type="button"
  className="btn btn-outline-primary mb-3"
  onClick={getLocation}
>
  📍 Capture Location
</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;