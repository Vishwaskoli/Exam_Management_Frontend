import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  CButton, CCard, CCardBody,
  CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CRow,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CSpinner
} from '@coreui/react'
import { cilPlus, cilOptions } from '@coreui/icons';
import CIcon from '@coreui/icons-react'
import api from '../api';
import '../css/company.css';
// import { DocsComponents, DocsExample } from 'src/components'
import { removeSpecialChars, allowOnlyLetters, getCurrentLocationPromise } from '../Utility';

//import  '../../../components/AppSidebarNav';
const Department = () => {
  // Step 1: Define state for form fields and fetched data
  const [departmentId, setDepartmentId] = useState('');  // store textfield value
  const [departmentName, setDepartmentName] = useState('');  // store textfield value
  const [departmentCode, setDepartmentCode] = useState(''); // store textfield value
  const [description, setDescription] = useState(''); // store textfield value
  const [departments, setDepartments] = useState([]); // to store all saved departments data
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // const handleClose = () => setShowModal(false);
  // const handleOpen = () => setShowModal(true);
  //  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null); // Keeps track of which row's menu is open
  const [selectedDept, setSelectedDept] = useState(null); // Store the selected department
  const [formMode, setFormMode] = useState('save'); // Default to 'save'
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationEnabled, setLocationEnabled] = useState(false);
  //PAGINATIO
  const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 10;
  const [errorMessage, setErrorMessage] = useState('');

const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;
const currentRows = departments.slice(indexOfFirstRow, indexOfLastRow);
const totalPages = Math.ceil(departments.length / rowsPerPage);

  const departmentInputRef = useRef(null);
  // Fetch current location
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
          console.error(error);
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


  // Fetch data from the API

  useEffect(() => {
    fetchDeptData(); // Initial fetch when the component mounts
  }, []);
  // Define fetchDeptData outside of useEffect
  const fetchDeptData = async () => {
    try {
      const response = await api.get('/Master/GetMastersData?mode=getDeptData');
      setDepartments(response.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching department data:', error);
      setLoading(false);
    }
  };
  const handleOpen = async () => {
    // Set the form mode to 'save' for new department creation

    // if (!locationEnabled) {
    //   alert("Location is required to access the form. Please enable location services.");
    //   return;
    let currentLoc = location;
    if (!currentLoc?.latitude || !currentLoc?.longitude) {
      try {
        // Background fetch failed or still in progress, try once more before blocking
        currentLoc = await getCurrentLocationPromise();
        setLocation(currentLoc);
        setLocationEnabled(true);
      } catch (err) {
        alert("Location is required to access the form. Please enable location services in your browser.");
        return;
      }
    }

    setFormMode('save');
    // Reset the form fields to empty for a new department
    setDepartmentName('');
    setDepartmentCode('');
    setDescription('');

    // Show the modal
    setShowModal(true);
  };
  const handleClose = () => {
    setFormMode('save'); // Reset to 'save' mode when closing the modal
    fetchDeptData();
    setShowModal(false);

  };

  //Auto Focus Department Name Input Field
  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        departmentInputRef.current?.focus();
      }, 300);
    }
  }, [showModal]);





  // If the data is still loading, display a spinner
  if (loading) {
    return <CSpinner color="primary" />;
  }

  // Function to safely extract the value or fallback if needed
  const safeRender = (value) => {
    if (value === null || value === undefined) {
      return ''; // Fallback for missing or invalid data
    }

    // If the value is an object (empty or not), return empty string
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return ''; // Empty string for empty objects
    }

    return value; // Return the value as is if it's already a string or number
  };
  // Function to handle the opening and closing of the context menu
  const toggleMenu = (deptId) => {
    if (activeMenu === deptId) {
      setActiveMenu(null); // Close the menu if clicked on the same icon again
    } else {
      setActiveMenu(deptId); // Open the menu for the clicked row
    }
  };

  // Function to handle actions when menu buttons (Edit/Delete) are clicked
  const handleMenuAction = (action, deptId) => {
    console.log(`${action} for dept_id: ${deptId}`); // Log the action along with the dept_id
    const dept = departments.find(d => d.dept_id === deptId); // Find the department by ID
    if (action === 'Edit' && dept) {
      // Perform edit action
      // alert(`Editing department with ID: ${deptId}`);
      // Call another function to handle the editing logic
      setFormMode('update');
      handleEdit(dept);
    } else if (action === 'Delete') {
      // Perform delete action
      handleDelete(deptId)
      // alert(`Deleting department with ID: ${deptId}`);
    }
    setActiveMenu(null); // Close the menu after performing the action
  };


  const handleDelete = async (deptId) => {
    //  const Id = dept.deptId;  // Use the leaveId directly from the argument
    if (window.confirm('Are you sure you want to delete this Department?')) {
      const deleteleave = {
        id: deptId,
        mode: 'delete_Dept',
        Obsolete: 'O',
      };

      try {
        const response = await api.post('/Master/save', deleteleave);
        if (response.data.message === 'Deleted') {
          alert('Deleted successfully!');

        } else {
          alert(`Error: ${response.data.message}`);
        }
      } catch (error) {
        console.error('Error ', error);
        alert('An error occurred while deleting.');
      }
      finally {
        fetchDeptData(); // Refresh the department data after deletion
      }
    }
  };



  // Separate function for handling the Edit logic
  const handleEdit = (dept) => {
    // Set the selected department to state1
    setSelectedDept(dept);
    setDepartmentName(dept.dept_name ?? '');
    setDepartmentId(dept.dept_id ?? '');
    setDepartmentCode(isEmptyObject(dept.dept_code) ? '' : dept.dept_code);
    setDescription(isEmptyObject(dept.dept_desc) ? '' : dept.dept_desc);

    // Show the modal
    setShowModal(true);
  };
  // Function to check if an object is empty
  const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  };
  const handleSave = async () => {
    // Validate form data

    if (!departmentName || departmentName.trim() === '') {
      alert('Department Name is  required!');
      return;
    }
    // if (!departmentName || !/^[A-Za-z\s]+$/.test(departmentName)) {
    //   alert('Enter Valid Department Name consisting of only letters and spaces.');
    //   return;
    // }
    if (!departmentCode || departmentCode.trim() === '') {
      alert('Department Code is required!');
      return;
    }
    // const specialChars = departmentCode.match(/[^a-zA-Z0-9 ]/g);
    // if (!departmentCode || specialChars) {
    //   alert(' Please enter a valid code consisting of only letters, numbers, and spaces.');
    //   return;
    // }
    // if ( !description) {
    //   alert('Description  is required!');
    //   return;
    // }
    // if (!description || !/^[A-Za-z\s]+$/.test(description)) {
    //   alert('Enter Valid Description consisting of only letters and spaces');
    //   return;
    // }

    if (!location.latitude || !location.longitude) {
      alert("Location data is required to submit the form.");
      return;
    }

    // Determine mode based on formMode (save or update)
    const mode = formMode === 'save' ? 'dept' : 'edit_dept';  // If 'save' then mode is 'dept', else 'edit_dept'
    // Determine dept_id based on formMode (save or update)
    const getdept_id = formMode === 'save' ? '0' : departmentId;
    const modify_by = formMode === 'save' ? '0' : localStorage.getItem('userid');

    // Prepare data to send
    const departmentData = {
      Latitude: String(location.latitude),
      Longitude: String(location.longitude),
      Modified_By: modify_by,
      name: departmentName.trim(),       // Sending 'name' instead of 'departmentName'
      companyCode: localStorage.getItem('Company_Code'),  // Replace with the actual company code, if applicable
      finYearCode: localStorage.getItem('Finyear'),  // Replace with the actual financial year code, if applicable
      createdBy: localStorage.getItem('userid'),   // You may replace it with the actual user
      // createdDate: new Date().toISOString(),  // You can set the current date if needed
      status: 'A',           // Use the correct status value based on your needs
      code: departmentCode.trim(),       // The department code
      desc: description.trim(),          // The department description
      mode: mode,
      id: getdept_id           // Assuming the operation is an "Insert", adjust as needed
    };

    // setLoading(true);  // Show loading while posting data

    try {
      // Step 4: POST request to save the new department using api.post()
      const response = await api.post('/Master/save', departmentData);  // Use correct API URL
      if (response.data.message === 'inserted') {  // Assuming the response from the server is 'inserted'
        alert('Department saved successfully!');
        //  handleClose();  // Close modal after successful save
        setFormMode('save');
        setDepartmentName('');
        setDepartmentId('');
        setDepartmentCode('');
        setDescription('');

      }
      // if (response.data.message === 'updated') {  // Assuming the response from the server is 'inserted'
      //   alert('branch updated successfully!');
      // handleClose();  // Close modal after successful save
      // } 
      else if (response.data.message === 'Name already exists') { alert('Name already exists'); }
      else {
        alert('Error saving Department!');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('There was an error saving the department.');
    } finally {
      // setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const hasSpecialChar = /[^a-zA-Z0-9 ]/.test(searchValue);
    const isOnlyNumbers = /^[0-9]+$/.test(searchValue);

    if (hasSpecialChar) {
      alert('Please enter valid characters (letters, numbers, and spaces only) while searching.');
      return;
    }
    if (isOnlyNumbers) {
      alert('Searching by numbers is not allowed. Please enter valid characters (letters, numbers, and spaces only).');
      return;
    }
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      // Refresh the page if the search box is empty or contains only spaces
      // window.location.reload();
      fetchDeptData(); // Fetch all departments again
      return;
    }
    const filtered = departments.filter(emp =>
      emp.dept_name.toLowerCase().includes(searchValue.toLowerCase())
      ||
      emp.dept_code.toLowerCase().includes(searchValue.toLowerCase())
    );
    setDepartments(filtered);
  };




  return (
    <div className='pt-30'>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-1">
            {/* <CCardHeader>
          <div style={{display:'flex', justifyContent:'space-between',alignItems:'center'}}>
            <strong style={{paddingLeft:'1%'}}>Department Master</strong>  
            <CFormInput
  type="text"
  //placeholder="Search employee..."
  //onChange={handleSearch}
  className="mt-3 w-100 w-sm-75 w-md-50 w-lg-25"  // 50% width on small screens, 25% on medium screens and above
/>

            <CButton color="primary" type="button" className="mb-1 mt-1 ml-auto" onClick={handleOpen}>
            <CIcon icon={cilPlus} style={{color:'white',fontWeight:'bold', fontSize: '1.5rem' }}/> New Department
            </CButton>
          </div></CCardHeader> */}
            <CCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <strong style={{ paddingLeft: '1%' }}>Department Master</strong>

                {/* This div will make sure the search and button are aligned to the right */}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  {/* Small Search Input */}
                  <CFormInput
                    id="hrms-department-input-search"
                    type="text"
                    placeholder="Search Department"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="mt-1 mb-1"  // Small search bar
                    style={{ maxWidth: '200px', marginRight: '10px' }}  // Adjust width and space between search and button
                  />

                  {/* New Department Button */}
                  <CButton
                    id="hrms-department-button-new"
                    color="primary"
                    type="button"
                    className="btn-sm mb-1 mt-1"
                    onClick={handleOpen}
                    style={{ height: 'auto', lineHeight: 'normal' }}  // Ensures the button stays in line with the search
                  >
                    {/* <CIcon icon={cilPlus} style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }} /> */}
                    New Department
                  </CButton>
                </div>
              </div>
            </CCardHeader>
            <CCardBody style={{ height: "500px", overflowY: "auto" }}>

              <CTable hover responsive style={{ fontSize: '13px' }}>
                <CTableHead style={{ position: 'sticky', top: '-16px', zIndex: '1' }}>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Sr.No.</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="hidden">Dept. ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Dept. Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Dept. Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Dept. Desc.</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell> {/* Last column for the context menu */}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentRows.length > 0 ? (
                    currentRows.map((dept, index) => (
                      <CTableRow key={dept.dept_id}>
                        <CTableDataCell>{indexOfFirstRow + index + 1}</CTableDataCell> {/* Serial Number */}
                        <CTableDataCell className="hidden">{safeRender(dept.dept_id)}</CTableDataCell>
                        <CTableDataCell>{safeRender(dept.dept_name)}</CTableDataCell>
                        <CTableDataCell>{safeRender(dept.dept_code)}</CTableDataCell> {/* Handle dept_code */}
                        <CTableDataCell>{safeRender(dept.dept_desc)}</CTableDataCell> {/* Handle dept_desc */}
                        {/* Context Menu Icon */}
                        <CTableDataCell>
                          <div style={{ position: 'relative' }}>
                            {/* CoreUI 3-dot vertical options icon */}
                            <CIcon
                              icon={cilOptions}
                              style={{ cursor: 'pointer', fontSize: '20px' }}
                              onClick={() => toggleMenu(dept.dept_id)}
                            />

                            {/* Context Menu - Displayed when icon is clicked */}
                            {activeMenu === dept.dept_id && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '0', width: '78%',
                                  right: '0px',
                                  backgroundColor: '#fff',
                                  border: '1px solid #ddd',
                                  padding: '10px',
                                  boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                  zIndex: 1,
                                }}
                              >
                                <CButton color="primary" type="button" className="btn-sm w-100"
                                  style={{ display: 'block', margin: '5px 0' }}
                                  id={`hrms-department-button-edit-${dept.dept_id}`}
                                  onClick={() => handleMenuAction('Edit', dept.dept_id)}
                                >
                                  Edit
                                </CButton>
                                <CButton color="primary" type="button" className="btn-sm w-100"
                                  style={{ display: 'block', margin: '5px 0' }}
                                  id={`hrms-department-button-delete-${dept.dept_id}`}
                                  onClick={() => handleMenuAction('Delete', dept.dept_id)}
                                >
                                  Delete
                                </CButton>
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No Departments available.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
              <div
  style={{
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div>
    Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, departments.length)} of{" "}
    {departments.length} entries
  </div>

  <div style={{ display: "flex", gap: 10 }}>
    <CButton
      color="primary"
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
    >
      Prev
    </CButton>

    <CButton
      color="primary"
      size="sm"
      disabled={currentPage === totalPages || totalPages === 0}
      onClick={() => setCurrentPage((p) => p + 1)}
    >
      Next
    </CButton>
  </div>
</div>

            </CCardBody>
          </CCard>
        </CCol>

        {/* Modal */}
        <CModal visible={showModal} onClose={handleClose} size="lg">
  <CModalHeader>
    <CModalTitle>{formMode === 'save' ? 'New Department' : 'Edit Department'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>

      {/* Department Name and Code */}
      <div className="mb-3">
        <CRow>
          <CCol md={7}>
            <div className={`google-floating-group ${departmentName ? 'has-value' : ''}`}>
              <CFormInput
                type="text"
                placeholder=" "
                ref={departmentInputRef}
                id="departmentName"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
              <label>Department Name <span style={{ color: 'red' }}>*</span></label>
            </div>
          </CCol>
          <CCol md={5}>
            <div className={`google-floating-group ${departmentCode ? 'has-value' : ''}`}>
              <CFormInput
                type="text"
                placeholder=" "
                id="departmentCode"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
              />
              <label>Department Code <span style={{ color: 'red' }}>*</span></label>
            </div>
          </CCol>
        </CRow>
      </div>

      {/* Description */}
      <div className="mb-3">
        <div className={`google-floating-group ${description ? 'has-value' : ''}`}>
          <CFormTextarea
            placeholder=" "
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label>Description</label>
        </div>
      </div>

    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="primary"
      id="hrms-department-button-save"
      onClick={handleSave}
    >
      {formMode === 'save' ? 'Save' : 'Update'}
    </CButton>
    <CButton
      color="secondary"
      id="hrms-department-button-close"
      onClick={handleClose}
    >
      Close
    </CButton>
  </CModalFooter>
</CModal>

      </CRow>
    </div>
  );
}

export default Department;
