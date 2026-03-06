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
  Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";

const api = axios.create({
  baseURL: "https://localhost:7248/api",
});

const Report = () => {

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [semId, setSemId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showTable, setShowTable] = useState(true);

  const top5 = data.slice(0, 5);

  const barColors = [
    "#FFD700",
    "#C0C0C0",
    "#CD7F32",
    "#4CAF50",
    "#2196F3",
  ];

  useEffect(() => {
    loadCourses();
    loadStudents();
  }, []);

  const loadCourses = async () => {
    const res = await api.get("/CourseMaster");
    setCourses(res.data);
  };

  const loadStudents = async () => {
    const res = await api.get("/Student");
    setStudents(res.data);
  };

  const loadSemesters = async (courseId) => {

    const mappingRes = await api.get(`/SubjectSemMapping/SemesterByCourse/${courseId}`);
    const semesterIds = mappingRes.data;

    const semRes = await api.get("/SemesterMaster");

    const filtered = semRes.data.filter((s) =>
      semesterIds.includes(s.sem_Id)
    );

    setSemesters(filtered);
  };

  const loadSubjects = async (courseId, semId) => {

    const mappingRes = await api.get(
      "/SubjectSemMapping/SubjectByCourseAndSemester",
      { params: { courseId, semId } }
    );

    const subjectIds = mappingRes.data;

    const subjectRes = await api.get("/SubjectMaster");

    const filtered = subjectRes.data.filter((s) =>
      subjectIds.includes(s.subject_Id)
    );

    setSubjects(filtered);
  };

  const generateReport = async () => {

    if (!courseId) {
      alert("Please select Course");
      return;
    }

    try {

      setLoading(true);

      const params = {
        courseId: courseId || null,
        semId: semId || null,
        subjectId: subjectId || null,
      };

      const res = await api.get("/Top3Rank", { params });

      setData(res.data);

    } catch (err) {

      alert("Error generating report");

    } finally {

      setLoading(false);

    }
  };

  const getStudentName = (studentId) => {

    const student = students.find(
      (s) => Number(s.student_Id) === Number(studentId)
    );

    if (!student) return "Unknown";

    return `${student.stu_FirstName} ${student.stu_LastName}`;
  };

  const filteredData = searchTerm
    ? data.filter((item) =>
      getStudentName(item.student_Id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    : data;

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.text("Student Result Report", 14, 15);

    const tableData = data.map((item) => {

      return [
        item.rankPosition,
        getStudentName(item.student_Id),
        item.student_Id,
        `${item.obtained_Marks}/${item.total_Marks}`,
        `${item.percentage?.toFixed(2)}%`
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [["Rank", "Name", "Student ID", "Marks", "Percentage"]],
      body: tableData,
    });

    doc.save("StudentReport.pdf");
  };

  return (

    <div className="container mt-5">

      <div className="card shadow-lg p-4">

        <h3 className="text-center mb-4 text-primary fw-bold">
          Student Report Dashboard
        </h3>

        {/* Filters */}

        <div className="row g-3">

          <div className="col-md-4">
            <label>Course</label>
            <select
              className="form-select"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                loadSemesters(e.target.value);
              }}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_Id} value={c.course_Id}>
                  {c.course_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label>Semester</label>
            <select
              className="form-select"
              value={semId}
              onChange={(e) => {
                setSemId(e.target.value);
                loadSubjects(courseId, e.target.value);
              }}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.sem_Id} value={s.sem_Id}>
                  {s.sem_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label>Subject</label>
            <select
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
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

        {/* Buttons */}

        <div className="text-center mt-4">

          <button
            className="btn btn-primary me-3"
            onClick={generateReport}
          >
            Generate Report
          </button>

          {data.length > 0 && (
            <button
              className="btn btn-success"
              onClick={exportPDF}
            >
              Export PDF
            </button>
          )}

        </div>

        {/* Exam Information */}

        {data.length > 0 && (

          <div className="card mt-4 shadow-sm p-3 bg-light">

            <h5 className="text-center mb-3">Exam Information</h5>

            <div className="row text-center">

              <div className="col-md-4">
                <b>Course :</b>{" "}
                {courses.find(c => c.course_Id == courseId)?.course_Name}
              </div>

              <div className="col-md-4">
                <b>Semester :</b>{" "}
                {semesters.find(s => s.sem_Id == semId)?.sem_Name}
              </div>

              <div className="col-md-4">
                <b>Subject :</b>{" "}
                {subjects.find(s => s.subject_Id == subjectId)?.subject_Name}
              </div>

            </div>

          </div>

        )}

        {/* Graph */}

        {data.length > 0 && (

          <div className="card mt-4 shadow-sm p-4">

            <h5 className="text-center mb-4">
              Top 5 Students Performance
            </h5>

            <ResponsiveContainer width="100%" height={350}>

              <BarChart data={top5}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="student_Id"
                  tickFormatter={(value) =>
                    getStudentName(value)
                  }
                />

                <YAxis />

                <Tooltip />

                <Bar dataKey="percentage">

                  {top5.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={barColors[index]}
                    />
                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

        {/* Search */}

        {data.length > 0 && (

          <div className="mt-4">

            <input
              type="text"
              className="form-control"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>

        )}

        {/* Table Toggle */}

        {data.length > 0 && (

          <div className="d-flex align-items-center mt-4">

            <button
              className="btn btn-outline-primary me-3"
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? "Hide Table ▲" : "Show Table ▼"}
            </button>

            <h5 className="mb-0">Student Result Table</h5>

          </div>

        )}

        {/* Table */}

        {data.length > 0 && showTable && (

          <table className="table table-bordered table-hover mt-3">

            <thead className="table-dark">

              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>ID</th>
                <th>Marks</th>
                <th>Percentage</th>
              </tr>

            </thead>

            <tbody>

              {filteredData.map((item, index) => {

                let medal = item.rankPosition;

                if (item.rankPosition === 1) medal = "🥇";
                if (item.rankPosition === 2) medal = "🥈";
                if (item.rankPosition === 3) medal = "🥉";

                return (

                  <tr key={index}>

                    <td>{medal}</td>

                    <td>{getStudentName(item.student_Id)}</td>

                    <td>{item.student_Id}</td>

                    <td>
                      {item.obtained_Marks}/{item.total_Marks}
                    </td>

                    <td>
                      {item.percentage?.toFixed(2)}%
                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
};

export default Report;