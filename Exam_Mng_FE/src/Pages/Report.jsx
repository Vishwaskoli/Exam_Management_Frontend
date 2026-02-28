import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const api = axios.create({
  baseURL: "https://localhost:7248/api",
});

const Report = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [semId, setSemId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD COURSES ================= */
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get("/CourseMaster");
      setCourses(res.data);
    } catch (error) {
      console.error("Course API error:", error);
    }
  };

  /* ================= LOAD SEMESTERS (DEPEND ON COURSE) ================= */
  const loadSemesters = async (courseId) => {
    try {
      const res = await api.get("/CourseSemMapping", {
        params: { courseId },
      });

      const formatted = res.data.map((item) => ({
        sem_Id: item.sem_Id,
        sem_Name: item.sem_Name,
      }));

      setSemesters(formatted);
    } catch (error) {
      console.error("Semester API error:", error);
    }
  };

  /* ================= LOAD SUBJECTS (DEPEND ON COURSE + SEM) ================= */
  const loadSubjects = async (courseId, semId) => {
    try {
      const res = await api.get("/Subject_Master", {
        params: { courseId, semId },
      });

      setSubjects(res.data);
    } catch (error) {
      console.error("Subject API error:", error);
    }
  };

  /* ================= HANDLERS ================= */

  const handleCourseChange = (e) => {
    const value = e.target.value;

    setCourseId(value);
    setSemId("");
    setSubjectId("");
    setSemesters([]);
    setSubjects([]);
    setData([]);

    if (value) {
      loadSemesters(value);
    }
  };

  const handleSemChange = (e) => {
    const value = e.target.value;

    setSemId(value);
    setSubjectId("");
    setSubjects([]);
    setData([]);

    if (value && courseId) {
      loadSubjects(courseId, value);
    }
  };

  /* ================= GENERATE REPORT ================= */

  const generateReport = async () => {
    if (!courseId || !semId || !subjectId) {
      alert("Please select Course, Semester and Subject");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/Top3Rank", {
        params: { courseId, semId, subjectId },
      });

      setData(res.data);
    } catch (error) {
      console.error("Report API error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h4 className="text-center mb-4 fw-bold">
          Student Result Report
        </h4>

        <div className="row g-3">
          {/* COURSE */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Select Course</label>
            <select
              className="form-select"
              value={courseId}
              onChange={handleCourseChange}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_Id} value={c.course_Id}>
                  {c.course_Name}
                </option>
              ))}
            </select>
          </div>

          {/* SEMESTER */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Select Semester
            </label>
            <select
              className="form-select"
              value={semId}
              onChange={handleSemChange}
              disabled={!courseId}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.sem_Id} value={s.sem_Id}>
                  {s.sem_Name}
                </option>
              ))}
            </select>
          </div>

          {/* SUBJECT */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Select Subject
            </label>
            <select
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!semId}
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.subject_Id} value={sub.subject_Id}>
                  {sub.subject_Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary px-5"
            onClick={generateReport}
          >
            Generate Report
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center mt-3">
            Loading report...
          </div>
        )}

        {/* GRAPH + TABLE */}
        {data.length > 0 && (
          <>
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="student_Id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="obtained_Marks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table className="table table-bordered table-striped mt-4">
              <thead className="table-dark">
                <tr>
                  <th>Rank</th>
                  <th>Student ID</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.rankPosition}</td>
                    <td>{item.student_Id}</td>
                    <td>
                      {item.obtained_Marks} / {item.total_Marks}
                    </td>
                    <td>{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Report;