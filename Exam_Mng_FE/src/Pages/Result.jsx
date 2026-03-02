import React, { useEffect, useState } from "react";
import {
  getResults,
  saveResult,
  deleteResult,
} from "../services/resultService";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
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
  createdBy: 1,
  modifiedBy: 1,
};

const Result = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [pageMode, setPageMode] = useState("list");
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const res = await getResults();
      setResults(res.data);

      const courseRes = await axios.get(
        `${API_BASE}/CourseMaster/ActiveCourses`
      );
      setCourses(courseRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ================= CASCADING =================

const handleCourseChange = async (courseId) => {
  setForm({ ...initialFormState, courseId });

  try {
    const semRes = await axios.get(
      `${API_BASE}/SemesterMaster/ByCourse/${courseId}`
    );
    setSemesters(semRes.data);

    const stuRes = await axios.get(`${API_BASE}/Student`);

    console.log("Students from API:", stuRes.data); // 👈 DEBUG

    const filteredStudents = stuRes.data.filter(
      s => s.courseId == parseInt(courseId)   // ⚠ must match backend property name
    );

    setStudents(filteredStudents);
    console.log("Selected Course:", courseId);
console.log("Filtered:", filteredStudents);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load related data");
  }
};
  const handleSemesterChange = async (semId) => {
    setForm((prev) => ({
      ...prev,
      semId,
      examId: "",
      subjectId: "",
      totalMarks: "",
    }));

    try {
      const examRes = await axios.get(
        `${API_BASE}/ExamMaster/GetByCourseSem?courseId=${form.courseId}&semId=${semId}`
      );
      setExams(examRes.data);

      const subRes = await axios.get(
        `${API_BASE}/SubjectSemMapping/GetSubjects?courseId=${form.courseId}&semId=${semId}`
      );
      setSubjects(subRes.data);
    } catch {
      toast.error("Failed to load exams/subjects");
    }
  };

  const handleExamChange = async (examId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/ExamMaster/GetTotalMarks/${examId}`
      );

      setForm((prev) => ({
        ...prev,
        examId,
        totalMarks: res.data.totalMarks,
      }));
    } catch {
      toast.error("Failed to fetch total marks");
    }
  };

  // ================= CALCULATIONS =================

  const percentage =
    form.totalMarks && form.obtainedMarks
      ? ((form.obtainedMarks / form.totalMarks) * 100).toFixed(1)
      : 0;

  const calculateGrade = (percent) => {
    if (percent >= 75) return "A";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 40) return "D";
    return "F";
  };

  const grade = calculateGrade(percentage);

  // ================= DUPLICATE CHECK =================

  const isDuplicate = () => {
    return results.some(
      (r) =>
        r.studentId === parseInt(form.studentId) &&
        r.examId === parseInt(form.examId) &&
        r.subjectId === parseInt(form.subjectId) &&
        r.resultId !== form.resultId
    );
  };

  // ================= SAVE =================

  const handleSave = async () => {
    if (!form.courseId) return toast.error("Select Course");
    if (!form.semId) return toast.error("Select Semester");
    if (!form.examId) return toast.error("Select Exam");
    if (!form.studentId) return toast.error("Select Student");
    if (!form.subjectId) return toast.error("Select Subject");

    if (!form.obtainedMarks)
      return toast.error("Enter Obtained Marks");

    if (form.obtainedMarks > form.totalMarks)
      return toast.error("Obtained marks cannot exceed total");

    if (isDuplicate())
      return toast.error("Duplicate result for same student + exam + subject");

    try {
      await saveResult(form);
      toast.success("Result saved successfully 🎉");

      setForm(initialFormState);
      setPageMode("list");
      loadInitialData();
    } catch {
      toast.error("Save failed");
    }
  };

  // ================= EDIT =================

  const handleEdit = (data) => {
    setForm({
      ...data,
    });
    setPageMode("edit");
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;

    try {
      await deleteResult({ resultId: id, modifiedBy: 1 });
      toast.success("Deleted successfully");
      loadInitialData();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= UI =================

  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>
      <ToastContainer autoClose={2000} />

      {pageMode === "list" && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h3>Result Master</h3>
            <button
              className="btn btn-primary"
              onClick={() => setPageMode("create")}
            >
              + Add Result
            </button>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <table className="table table-hover text-center">
                  <thead className="table-secondary">
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Marks</th>
                      <th>%</th>
                      <th>Grade</th>
                      <th width="120">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const percent = (
                        (r.obtainedMarks / r.totalMarks) *
                        100
                      ).toFixed(1);

                      return (
                        <tr key={r.resultId}>
                          <td>{r.studentName}</td>
                          <td>{r.examName}</td>
                          <td>
                            {r.obtainedMarks}/{r.totalMarks}
                          </td>
                          <td>{percent}%</td>
                          <td>{calculateGrade(percent)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(r)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDelete(r.resultId)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {(pageMode === "create" || pageMode === "edit") && (
        <div className="card shadow-sm p-4">
          <h4>{pageMode === "edit" ? "Edit Result" : "Add Result"}</h4>

          <select
            className="form-select mb-2"
            value={form.courseId}
            onChange={(e) =>
              handleCourseChange(e.target.value)
            }
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.course_Id} value={c.course_Id}>
                {c.course_Name}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={form.semId}
            onChange={(e) =>
              handleSemesterChange(e.target.value)
            }
            disabled={!form.courseId}
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.sem_Id} value={s.sem_Id}>
                {s.sem_Name}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={form.examId}
            onChange={(e) =>
              handleExamChange(e.target.value)
            }
            disabled={!form.semId}
          >
            <option value="">Select Exam</option>
            {exams.map((ex) => (
              <option key={ex.exam_Id} value={ex.exam_Id}>
                {ex.exam_Name}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={form.studentId}
            onChange={(e) =>
              setForm({ ...form, studentId: e.target.value })
            }
          >
            <option value="">Select Student</option>
            {students.map((st) => (
              <option key={st.student_Id} value={st.student_Id}>
               {st.stu_FirstName + " " + (st.stu_LastName ?? "")}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={form.subjectId}
            onChange={(e) =>
              setForm({ ...form, subjectId: e.target.value })
            }
          >
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub.subject_Id} value={sub.subject_Id}>
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
            className="form-control mb-2"
            value={form.totalMarks}
            disabled
          />

          <div className="alert alert-info">
            Percentage: {percentage}% | Grade: {grade}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setForm(initialFormState);
                setPageMode("list");
              }}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;