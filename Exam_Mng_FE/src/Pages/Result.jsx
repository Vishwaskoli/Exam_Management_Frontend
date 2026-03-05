import React, { useEffect, useState } from "react";
import { getResults, saveResult, deleteResult } from "../services/resultService";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "https://localhost:7248/api";

const initialForm = {
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
  const [marks, setMarks] = useState({});

  const [form, setForm] = useState(initialForm);

  const [pageMode, setPageMode] = useState("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const res = await getResults();
    setResults(res.data);

    const courseRes = await axios.get(`${API_BASE}/CourseMaster/ActiveCourses`);
    setCourses(courseRes.data);
  };
  // ================= GROUP RESULTS (Student + Exam) =================

  const groupedResults = Object.values(
    results.reduce((acc, r) => {

      const key = `${r.studentId}_${r.examId}`;

      if (!acc[key]) {
        acc[key] = {
          studentId: r.studentId,
          studentName: r.studentName,
          examId: r.examId,
          examName: r.examName,
          subjects: [],
          totalObtained: 0,
          totalMarks: 0
        };
      }

      acc[key].subjects.push(r);

      acc[key].totalObtained += r.obtainedMarks;
      acc[key].totalMarks += r.totalMarks;

      return acc;

    }, {})
  ).map(g => ({
    ...g,
    percentage: ((g.totalObtained / g.totalMarks) * 100).toFixed(2)
  }));
  // ================= SEARCH =================

  const filteredResults = groupedResults.filter((item) =>
    item.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= PAGINATION =================

  const totalPages = Math.ceil(filteredResults.length / recordsPerPage);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filteredResults.slice(indexOfFirst, indexOfLast);

  // ================= CASCADE LOADERS =================

  const loadSemesters = async (courseId) => {
    const res = await axios.get(`${API_BASE}/SemesterMaster/ByCourse/${courseId}`);
    setSemesters(res.data);
  };

  const loadStudents = async (courseId) => {
    try {
      const res = await axios.get(`${API_BASE}/Student`);

      const filtered = res.data.filter(
        (s) => Number(s.courseId) === Number(courseId)
      );

      setStudents(filtered);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    }
  };

  const loadExams = async (courseId, semId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/ResultMaster/GetByCourseSem?courseId=${courseId}&semId=${semId}`
      );
      setExams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load exams");
    }
  };

  const loadSubjects = async (examId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/ResultMaster/GetSubjectsForExam?examId=${examId}`
      );
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subjects");
    }
  };

  const loadStudentMarks = async (studentId, examId) => {
    try {

      const res = await axios.get(
        `${API_BASE}/ResultMaster/GetStudentResult?studentId=${studentId}&examId=${examId}`
      );

      const existingMarks = {};

      res.data.forEach(r => {
        existingMarks[r.subjectId] = r.obtainedMarks;
      });

      setMarks(existingMarks);

    } catch (err) {
      console.log("No existing marks");
    }
  };
  // const loadTotalMarks = async (examId) => {
  //   try {
  //     const res = await axios.get(
  //       `${API_BASE}/ResultMaster/GetTotalMarks/${examId}`
  //     );

  //     setForm((prev) => ({
  //       ...prev,
  //       totalMarks: res.data,
  //     }));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // ================= LOCATION =================

  const getLocationAsync = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) resolve({ latitude: 0, longitude: 0 });

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve({ latitude: 0, longitude: 0 })
      );
    });
  };

  // ================= SAVE =================

  const handleSave = async () => {

    if (!form.courseId || !form.semId || !form.examId || !form.studentId) {
      toast.error("Please select all fields");
      return;
    }

    const validMarks = Object.values(marks).filter(v => v !== "" && v !== null);

    if (validMarks.length === 0) {
      toast.error("Enter marks");
      return;
    }

    try {

      const location = await getLocationAsync();

      for (const subjectId in marks) {

        if (marks[subjectId] === "" || marks[subjectId] === null) continue;

        const obtained = Number(marks[subjectId]);

        const subject = subjects.find(
          s => Number(s.subjectId || s.subject_Id) === Number(subjectId)
        );

        if (!subject) continue;

        const total = Number(subject.totalMarks);

        if (obtained > total) {
          toast.error(`Obtained marks cannot be greater than ${total} for ${subject.subjectName}`);
          return;
        }

        const payload = {
          resultId: 0,
          courseId: Number(form.courseId),
          semId: Number(form.semId),
          examId: Number(form.examId),
          studentId: Number(form.studentId),
          subjectId: Number(subjectId),
          obtainedMarks: obtained,
          totalMarks: total,
          createdBy: 1,
          modifiedBy: 1,
          latitude: location.latitude,
          longitude: location.longitude
        };

        try {
          await saveResult(payload);
        } catch (err) {
          console.log("Duplicate ignored");
        }
      }

      toast.success("Result saved");

      setMarks({});
      setForm(initialForm);
      setPageMode("list");

      loadInitialData();

    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;

    const location = await getLocationAsync();

    await deleteResult({
      resultId: id,
      modifiedBy: 1,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    setResults((prev) => prev.filter((item) => item.resultId !== id));

    toast.success("Deleted");
  };

  const exportExcelAll = () => {

    const data = results.map((r) => ({
      Student: r.studentName,
      Subject: r.subjectName,
      Exam: r.examName,
      Marks: `${r.obtainedMarks}/${r.totalMarks}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const blob = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(blob, "All_Results.xlsx");
  };

  const exportPDFAll = () => {

    const doc = new jsPDF();

    const tableData = results.map((r) => [
      r.studentName,
      r.subjectName,
      r.examName,
      `${r.obtainedMarks}/${r.totalMarks}`
    ]);

    autoTable(doc, {
      head: [["Student", "Subject", "Exam", "Marks"]],
      body: tableData
    });

    doc.save("All_Results.pdf");
  };

  const exportExcelStudent = (studentName) => {

  const studentData = results.filter(
    (r) => r.studentName === studentName
  );

  if (studentData.length === 0) return;

  const student = studentData[0];

  let totalObtained = 0;
  let totalMarks = 0;
  let isFail = false;

  const tableData = studentData.map((r, index) => {

    totalObtained += r.obtainedMarks;
    totalMarks += r.totalMarks;

    if (r.obtainedMarks < 40) {
      isFail = true;
    }

    return {
      Sr: index + 1,
      Subject: r.subjectName,
      Obtained: r.obtainedMarks,
      Total: r.totalMarks
    };
  });

  const percentage = ((totalObtained / totalMarks) * 100).toFixed(2);
  const resultStatus = isFail ? "FAIL" : "PASS";

  // Header rows
  const sheetData = [
    ["XYZ UNIVERSITY"],
    ["Semester Result Report Card"],
    [],
    ["Student Name", student.studentName],
    ["Exam", student.examName],
    [],
    ["Sr", "Subject", "Obtained", "Total"],
    ...tableData.map(row => [
      row.Sr,
      row.Subject,
      row.Obtained,
      row.Total
    ]),
    [],
    ["Total Obtained", totalObtained],
    ["Total Marks", totalMarks],
    ["Percentage", `${percentage}%`],
    ["Result", resultStatus]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Column width
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 12 },
    { wch: 10 }
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Report Card");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([buffer], { type: "application/octet-stream" });

  saveAs(blob, `${studentName}_ReportCard.xlsx`);
};

  const exportPDFStudent = (studentName) => {

    const doc = new jsPDF();

    const studentData = results.filter(
      (r) => r.studentName === studentName
    );

    if (studentData.length === 0) return;

    const student = studentData[0];

    let totalObtained = 0;
    let totalMarks = 0;
    let isFail = false;

    const tableData = studentData.map((r) => {

      totalObtained += r.obtainedMarks;
      totalMarks += r.totalMarks;

      if (r.obtainedMarks < 40) {
        isFail = true;
      }

      return [
        r.subjectName,
        r.obtainedMarks,
        r.totalMarks
      ];
    });

    const percentage = ((totalObtained / totalMarks) * 100).toFixed(2);

    const resultStatus = isFail ? "FAIL" : "PASS";

    // University Header
    doc.setFontSize(18);
    doc.text("XYZ UNIVERSITY", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text("Semester Result Report Card", 105, 30, { align: "center" });

    doc.setFontSize(11);

    doc.text(`Student Name : ${student.studentName}`, 14, 45);
    doc.text(`Exam : ${student.examName}`, 14, 52);

    // Subjects Table
    autoTable(doc, {
      startY: 60,
      head: [["Subject", "Obtained", "Total"]],
      body: tableData
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Total Obtained : ${totalObtained}`, 14, finalY);
    doc.text(`Total Marks : ${totalMarks}`, 14, finalY + 7);
    doc.text(`Percentage : ${percentage}%`, 14, finalY + 14);

    doc.setFontSize(13);
    if (resultStatus === "PASS") {
      doc.setTextColor(0, 128, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(`Result : ${resultStatus}`, 14, finalY + 25);

    doc.save(`${studentName}_ReportCard.pdf`);
  };

  // ================= EDIT =================

  const handleEdit = async (row) => {
    try {

      await loadSemesters(row.courseId);
      await loadStudents(row.courseId);
      await loadExams(row.courseId, row.semId);
      await loadSubjects(row.examId);

      setForm({
        resultId: row.resultId,
        courseId: String(row.courseId),
        semId: String(row.semId),
        examId: String(row.examId),
        studentId: String(row.studentId),
        subjectId: String(row.subjectId),
        obtainedMarks: row.obtainedMarks,
        totalMarks: row.totalMarks,
        latitude: row.latitude ?? 0,
        longitude: row.longitude ?? 0
      });

      setPageMode("edit");

    } catch (err) {
      console.error(err);
      toast.error("Edit failed");
    }
  };

  // ================= CANCEL =================

  const handleCancel = () => {
    setForm(initialForm);
    setMarks({});
    setSemesters([]);
    setStudents([]);
    setExams([]);
    setSubjects([]);
    setPageMode("list");
  };

  return (
    <div className="container mt-4" style={{ paddingTop: "100px" }}>
      <ToastContainer autoClose={2000} />

      {/* ================= LIST VIEW ================= */}

      {pageMode === "list" && (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h3>Result Master</h3>

            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={exportExcelAll}>
                Export Excel
              </button>

              <button className="btn btn-danger" onClick={exportPDFAll}>
                Export PDF
              </button>
              <input
                className="form-control"
                placeholder="Search Student"
                style={{ width: "250px" }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <button
                className="btn btn-primary"
                onClick={() => {
                  setForm(initialForm);
                  setMarks({});
                  setSemesters([]);
                  setStudents([]);
                  setExams([]);
                  setSubjects([]);
                  setPageMode("create");
                }}
              >
                + Add Result
              </button>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover text-center">
                <thead className="table-secondary">
                  <tr>
                    <th>Sr</th>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Percentage</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    currentRecords.length > 0 ? (
                      currentRecords.map((item, index) => (
                        <tr key={`${item.studentId}_${item.examId}`}>
                          <td>{indexOfFirst + index + 1}</td>
                          <td>{item.studentName}</td>
                          <td>{item.examName}</td>
                          <td>{item.percentage}%</td>

                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="dropdown"
                              >
                                ⋮
                              </button>

                              <ul className="dropdown-menu">

                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => exportExcelStudent(item.studentName)}
                                  >
                                    Excel
                                  </button>
                                </li>

                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => exportPDFStudent(item.studentName)}
                                  >
                                    PDF
                                  </button>
                                </li>

                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleEdit(item.subjects[0])}
                                  >
                                    Edit
                                  </button>
                                </li>

                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDelete(item.subjects[0].resultId)}
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
                        <td colSpan="6">No records found</td>
                      </tr>
                    )}
                </tbody>
              </table>

              {/* Pagination */}

              {totalPages > 1 && (
                <div className="d-flex justify-content-end">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Prev
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 && "active"}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${currentPage === totalPages && "disabled"
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= CREATE / EDIT ================= */}

      {(pageMode === "create" || pageMode === "edit") && (
        <div className="card shadow-sm p-4 mt-3">
          <h4>{pageMode === "edit" ? "Edit Result" : "Add Result"}</h4>

          <select
            className="form-select mb-2"
            value={form.courseId}
            onChange={(e) => {
              setForm({ ...form, courseId: e.target.value });
              loadSemesters(e.target.value);
              loadStudents(e.target.value);
              // console.log(res.data);
            }}
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
            onChange={(e) => {
              setForm({ ...form, semId: e.target.value });
              loadExams(form.courseId, e.target.value);
            }}
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
            onChange={(e) => {

              const examId = e.target.value;

              setForm({ ...form, examId });

              loadSubjects(examId);

              if (form.studentId && examId) {
                loadStudentMarks(form.studentId, examId);
              }

            }}
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e.exam_Id} value={e.exam_Id}>
                {e.exam_Name}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={form.studentId}
            onChange={(e) => {

              const studentId = e.target.value;

              setForm({ ...form, studentId });

              if (studentId && form.examId) {
                loadStudentMarks(studentId, form.examId);
              }

            }}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.student_Id} value={s.student_Id}>
                {s.stu_FirstName} {s.stu_LastName}
              </option>
            ))}
          </select>

          {/* Subjects Table */}

          {subjects.length > 0 && (
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Obtained</th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.subjectId || sub.subject_Id}>
                    <td>{sub.subjectName}</td>
                    <td>{sub.totalMarks}</td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max={sub.totalMarks}
                        step="1"
                        value={marks[sub.subjectId || sub.subject_Id] || ""}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          const total = Number(sub.totalMarks);

                          if (value < 0) {
                            toast.error("Marks cannot be negative");
                            return;
                          }
                          if (value > total) {
                            toast.error(`Marks cannot be greater than ${total}`);
                            return;
                          }

                          setMarks(prev => ({
                            ...prev,
                            [sub.subjectId || sub.subject_Id]: value
                          }));
                        }}


                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleSave}>
              {pageMode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;