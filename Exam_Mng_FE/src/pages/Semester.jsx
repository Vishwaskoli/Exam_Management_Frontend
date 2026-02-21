import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CSpinner,
} from "@coreui/react";
import { cilOptions } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService";
import { ToastContainer, toast } from "react-toastify";

const Semester = () => {
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({
    sem_Id: 0,
    sem_Name: "",
    created_By: 1,
    modified_By: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const recordsPerPage = 5;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const res = await getSemesters();
    setSemesters(res.data);
  };

  const filteredSemesters = semesters.filter((item) =>
    item.sem_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSemesters.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredSemesters.slice(indexOfFirst, indexOfLast);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (form.sem_Id === 0) {
        const res = await createSemester(form);
        setSemesters([...semesters, { ...form, sem_Id: res.data?.id }]);
        toast.success("Semester added 🚀");
      } else {
        await updateSemester(form);
        setSemesters((prev) =>
          prev.map((item) =>
            item.sem_Id === form.sem_Id ? form : item
          )
        );
        toast.success("Semester updated ✏️");
      }
      setIsModalOpen(false);
      setForm({ sem_Id: 0, sem_Name: "", created_By: 1, modified_By: 1 });
    } catch {
      toast.error("Operation failed ❌");
    }
    setIsSaving(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteSemester({ sem_Id: deleteId, modified_By: 1 });
      setSemesters((prev) =>
        prev.filter((item) => item.sem_Id !== deleteId)
      );
      toast.success("Semester deleted 🗑️");
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  return (
    <>
      <ToastContainer />

      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Semester Master</strong>

          <div className="d-flex gap-2">
            <CFormInput
              placeholder="Search..."
              size="sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <CButton
              color="primary"
              size="sm"
              onClick={() => {
                setForm({
                  sem_Id: 0,
                  sem_Name: "",
                  created_By: 1,
                  modified_By: 1,
                });
                setIsModalOpen(true);
              }}
            >
              Add Semester
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Semester Name</CTableHeaderCell>
                <CTableHeaderCell className="text-center">
                  Action
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {currentRecords.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="3" className="text-center">
                    No records found
                  </CTableDataCell>
                </CTableRow>
              ) : (
                currentRecords.map((item) => (
                  <CTableRow key={item.sem_Id}>
                    <CTableDataCell>{item.sem_Id}</CTableDataCell>
                    <CTableDataCell>{item.sem_Name}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CDropdown>
                        <CDropdownToggle
                          color="light"
                          size="sm"
                          caret={false}
                        >
                          <CIcon icon={cilOptions} />
                        </CDropdownToggle>

                        <CDropdownMenu>
                          <CDropdownItem
                          className="cursor-pointer"
                            onClick={() => {
                              setForm(item);
                              setIsModalOpen(true);
                            }}
                          >
                            Edit
                          </CDropdownItem>

                          <CDropdownItem
                            className="text-danger"
                            onClick={() => {
                              setDeleteId(item.sem_Id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete
                          </CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <CPagination align="end" className="mt-3">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </CPaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <CPaginationItem
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          )}
        </CCardBody>
      </CCard>

      {/* Add/Edit Modal */}
      <CModal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CModalHeader>
          {form.sem_Id === 0 ? "Add Semester" : "Update Semester"}
        </CModalHeader>

        <CModalBody>
          <CFormInput
            placeholder="Enter Semester Name"
            value={form.sem_Name}
            onChange={(e) =>
              setForm({ ...form, sem_Name: e.target.value })
            }
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </CButton>

          <CButton color="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving && <CSpinner size="sm" className="me-2" />}
            {form.sem_Id === 0 ? "Save" : "Update"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <CModalHeader>Confirm Delete</CModalHeader>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </CButton>

          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Semester;
