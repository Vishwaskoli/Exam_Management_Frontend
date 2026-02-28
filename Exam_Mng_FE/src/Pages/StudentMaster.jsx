import React, { useEffect, useState } from 'react'

export const StudentMaster = () => {
    const [pageMode, setPageMode] = useState("view");
    const [searchTerm, setSearchTerm] = useState("");
    const [studentsList, setStudentsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState("");
    const emptyForm = {
        Stu_FirstName: "",
        Stu_LastName: "",
        Stu_MiddleName: "",
        Aadhaar_No: "",
        DOB: "",
        Email: "",
        Phone_No: "",
        Student_Code: "",
        CourseId: "",
    };
    const [formData, setFormData] = useState(emptyForm);
    const [courses, setCourses] = useState([]);

    const [image, setImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const studentsPerPage = 10;
    const [editStudentId, setEditStudentId] = useState(null);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = "https://localhost:7248/api/Student";

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
                    //   console.error(error);
                    setLocationEnabled(false);
                }
            );
        } else {
            setErrorMessage("Geolocation is not supported by your browser.");
            setLocationEnabled(false);
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [])

    const fetchCourses = async () => {
        try {
            const response = await fetch("https://localhost:7248/api/CourseMaster/ActiveCourses");
            const data = await response.json();
            // console.log(data)
            setCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (student) => {
        // console.log(student)
        setEditStudentId(student.student_Id);

        setFormData({
            Stu_FirstName: student.stu_FirstName,
            Stu_MiddleName: student.stu_MiddleName,
            Stu_LastName: student.stu_LastName,
            Aadhaar_No: student.aadhaar_No,
            DOB: student.dob?.split("T")[0], // important for date input
            Email: student.email,
            Phone_No: student.phone_No,
            Student_Code: student.student_Code,
            CourseId: student.courseId,
        });

        console.log(formData.DOB)

        setPageMode("edit");
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}`
            );

            if (!response.ok) throw new Error("Failed to fetch courses");

            const data = await response.json();
            // console.log(data)
            setStudentsList(data);
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, [])



    const filteredStudents = studentsList.filter((stu) =>
        stu.stu_FirstName.toLowerCase().includes(searchTerm.toLowerCase()) || stu.stu_LastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;

    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!location.latitude || !location.longitude) {
            alert("Location not available");
            return;
        }

        if (!formData.Stu_FirstName ||
            !formData.Email ||
            !formData.Aadhaar_No ||
            !formData.Student_Code ||
            !formData.CourseId ||
        !formData.DOB)
             {
            alert("Please fill all required fields");
            return;
        }
console.log("DOB:", formData.DOB);
        const data = new FormData();

        // Append form fields
        data.append("Stu_FirstName", formData.Stu_FirstName);
        data.append("Stu_MiddleName", formData.Stu_MiddleName);
        data.append("Stu_LastName", formData.Stu_LastName);
        data.append("Aadhaar_No", formData.Aadhaar_No);
        data.append("Phone_No", formData.Phone_No);
        data.append("DOB", formData.DOB);
        data.append("Email", formData.Email);
        data.append("Student_Code", formData.Student_Code);
        data.append("CourseId", formData.CourseId);

        // Passing lat/long directly
        data.append("Latitude", location.latitude);
        data.append("Longitude", location.longitude);

        // Image
        if (image) {
            data.append("image", image);
        }

        try {
            const response = await fetch("https://localhost:7248/api/Student", {
                method: "POST",
                body: data
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("SERVER ERROR:", errorText);  // 👈 ADD THIS
                throw new Error("Failed to create student");
            }

            const result = await response.json();
            // console.log(result);
            alert("Student Created Successfully");
            setCurrentPage("list");
            fetchStudents();

        } catch (error) {
            console.error(error);
        }
    };

    // console.log(courses.find(c => c.course_Id === 2))

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!location.latitude || !location.longitude) {
            alert("Location not available");
            return;
        }
        // console.log(formData.DOB)

        const data = new FormData();

        // IMPORTANT: Send Student_Id in body
        data.append("Student_Id", editStudentId);

        data.append("Stu_FirstName", formData.Stu_FirstName);
        data.append("Stu_MiddleName", formData.Stu_MiddleName);
        data.append("Stu_LastName", formData.Stu_LastName);
        data.append("Email", formData.Email);
        data.append("Aadhaar_No", formData.Aadhaar_No);
        data.append("CourseId", formData.CourseId);
        data.append("Phone_No", formData.Phone_No);
        data.append("Student_Code", formData.Student_Code);
        data.append("DOB", formData.DOB);

        data.append("Latitude", location.latitude);
        data.append("Longitude", location.longitude);

        // If backend requires these (optional — only if needed)
        data.append("Modified_By", 1);
        data.append("Modified_Date", new Date().toISOString());

        // Image
        if (image) {
            data.append("image", image);
        }

        try {
            console.log("Editing ID:", editStudentId);
            const response = await fetch(`${API_BASE_URL}/Update`, {
                method: "POST",   // ✅ POST not PUT
                body: data
            });

            if (!response.ok) {
                const errorText = await response.text();
                // console.log("Server Error:", errorText);
                alert("Something went wrong while updating the student. Please try again.")
                throw new Error("Failed to update student");
            }

            alert("Student Updated Successfully");

            setFormData(emptyForm);
            setEditStudentId(null);
            setImage(null);
            setPageMode("view");

            fetchStudents();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (student) => {

        if (!location.latitude || !location.longitude) {
            alert("Location not available. Please enable location.");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${student.stu_FirstName}?`
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/Delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Student_Id: student.student_Id,
                    Modified_By: 1,
                    Latitude: location.latitude,
                    Longitude: location.longitude
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Server Error:", errorText);
                throw new Error("Failed to delete student");
            }

            alert("Student Deleted Successfully");
            fetchStudents();

        } catch (error) {
            console.error(error);
        }
    };

    if (loading)
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );

    if (error) return <div className="alert alert-danger">{error}</div>;


    return (
        <div className='container mt-4'>


            {pageMode === "create" || pageMode === "edit" ?
                (
                    <>

                        <div className='d-flex mb-3'>
                            {pageMode === "create" ? <h3>Create Student</h3> : <h3>Edit Student</h3>}
                        </div>
                        <div className='card shadow-sm'>
                            <div className='card-body'>
                                {pageMode == "edit" && (<div className="d-flex justify-content-center"
                                ><img src={`${API_BASE_URL}/image/${editStudentId}`} height="100px" width="100px" className='mb-5 img-fluid' onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAP1BMVEWjo6P///+fn5/8/Pyzs7OmpqapqamZmZna2tqcnJywsLDq6urd3d2srKzMzMz5+fny8vK8vLzS0tLj4+PDw8PtHRSaAAAFhklEQVR4nO2ci3KrIBCGcRUI3lHf/1kPiGnNaUwVUNbOftNO0lw6+7sXVwQYIwiCIAiCIAiCIAiCIAiCIP4qYEhtQwRASsmasijKhpunN5akJOhh7PKFbhw0SJXaKi+ATVX2g2pi93MPlI+fShyP8lZygJX1lhRLXaa2cD/QDJ+kGPKhuYV3OGP6Ta68yR37UezwoftdS5Z1ww20iDrfo8WEWi2QhxrwcZ8Uy4i8SsOOdPmmQi1GHtJi1MjUFm8jP55d3lGjVSPbo1qyrEWqBsqddWxFnmPtbQ4mjKNKbfVbVHvcMdY3LcKLAih7Hy1Z1iMMNPitudxkQCcGSq+MsVToXAMeZflJi02MONCT/c/YpLb+FdC7+v73dBqXa0KizMRZavNfCYkyE2eormy8TzKOHtcAhw7RkmUFJs+wKUzMlNr+F7xP/44htf1r+OGrsldqTCM1R4Yx3jFiEhNWmZGJ4d5dpqMSqRWsCBaDyjN/Ksz+khi2eWdpHw9UYoKaZmxtc2BvplPbvwYKr2GmJzmuRvNPXQLwoAqAK/8ZBF0DTKiizCRNQA9Q4UoZFnSmeaS2/X9g8h5r6pBFGQvpaHD1MjPK1zXdhPCeBvN0zZja7nd4jtBiG5tdUF5DNAPGIDOAR0/To/QLs3NNsoP9Zp5xrGKYKo46pkAaZBY5HXJNPiGd0uBQ7YGS1mG8a74G9qvp0N3L/Mm0s6b1uIb+N9C7WoGxSG3nLqD5beJJnuXtPabPWuy05k1B+b0mNhs+XXmOuizv4xiL2pp0XjcNU4zfyzdMgq67l2DLu1qDhAKKprzDFO0XQEquh7qaqQfN5xU0XDTADamt22LbMGBKSqmU/V3SBAomGoFWzP77XrMC0TCObO7PF3wtZjnefPX4dIF9Lubw4oKvPrP6Wmpm276ecWfiU8JKins+vwlfGr8fUMiZzbdiZv8sYvjTbP5tJp9z3r4/iwG2/OE+KgDDXCBrEFgx5tcYJObEnjXBctgFPM2dw8zWhEWMe0/MBwIQ3G8G7kQsdpsf8RU3fIlBWMLJSZ6/IZxT2PcXEWhxEeWOuflDqEWKUC7J3dF3uuYwWomxrzzfc+8mDzRjhzAalvJsZBjXgAk8p2sRM7tlSYoG+EqMsirn/5FcicUcWWiWimZcpEAt2e/EwOISgKW8Ke5caQsB//KM/RhgGKlZFVWwnplfM4a5Fc2m1pnjLlwumdfYc5kzXz2YQwEIwuwtVkZTFlpP7TA8HvXMYxiGdtK6KAW7ycJtMGHWWBFj1b8d2uj6arSizHUAbkWgoJmGeux/HT3L+7EepgYUUj2gVGH9sXsYMDc+aguFUI9VckDIStBg9KS2fg1I1lad5ySNvKtahmbbA5DlGDTbxAgaSxRyQBVBU02e9AWC5NH9hyGy/Zh/0aed2wR8z2r5/VQ6WUcDTO9dYb6XvNZpmhpVDlGS5ZV+KK8v1ADv9i6JQXX57BMlHgHrsj7TPcSlzlFxE/9/Kn2hGth7d8yX/rpQ818su5/LltUGzsjeR32JlNCp8nu5YhraVVouUGO3Yol81t8iN2pOTpzAxWXHODlvLqhja85cJei5s4Q/J+5JofTJ58qfdKf1As1lheyb0/YKuDhhHOekTdD+Bf6cM7s2dGGpL+MZ96ECF5b7c8K8NHHqFcwnTlheG7hELoToQ1DHtpSLS+y9qaBMpyXLIm8ZdHxPuZhE3p9OptSSZVHFQJNWTNRJkPKSy/5tHjHbTXl5u/xKHzPOIK2WLIsYZmkLsyVicVYJT/+OiK2zCty7IJyIl89+S+NiEnGZXerKbGpzvHJGYkgMiSExJIbEkBgSQ2JIzEli8sREHNGApkhM1PtnkJqYYgiCIAiCIAiCIAiCIAiCIIi4/ANQ9Ut4SzadUQAAAABJRU5ErkJggg==';
                                }} /></div>)}
                                <form className="w-100">
                                    <div className='d-flex gap-3 w-100 mb-3'>
                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Stu_FirstName" value={formData.Stu_FirstName} id="small_outlined" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="small_outlined" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">First Name</label>
                                        </div>
                                        {/* Name Section */}


                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Stu_MiddleName" value={formData.Stu_MiddleName} id="middlename" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="middlename" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Middle Name</label>
                                        </div>
                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Stu_LastName" value={formData.Stu_LastName} id="lastname" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="lastname" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Last Name</label>
                                        </div>
                                    </div>
                                    <div className='d-flex gap-3 w-100 mb-3'>


                                        {/* Contact Section */}

                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Email" value={formData.Email} id="Email" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="Email" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Email</label>
                                        </div>

                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Phone_No" value={formData.Phone_No} id="Phone" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="Phone" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Phone Number</label>
                                        </div>

                                        <div className="relative flex-fill">
                                            <input type="date" onChange={handleChange} name="DOB" value={formData.DOB} id="dob" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="dob" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Date of Birth</label>
                                        </div>

                                    </div>
                                    {/* Academic Section */}
                                    <div className='d-flex gap-3 w-100 mb-3'>

                                        <div className="relative flex-fill">

                                            <select
                                                className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4"
                                                name="CourseId"
                                                value={formData.CourseId}
                                                onChange={handleChange}
                                                id="course"
                                                required
                                            >
                                                <option value="">Select Course</option>
                                                {courses.map(course => (
                                                    <option key={course.course_Id} value={course.course_Id}>
                                                        {course.course_Name}
                                                    </option>
                                                ))}
                                            </select>
                                            <label htmlFor='course' className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Course *</label>
                                        </div>

                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Student_Code" value={formData.Student_Code} id="studentcode" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="studentcode" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Student Code</label>
                                        </div>

                                    </div>
                                    {/* Identity Section */}
                                    <div className='d-flex gap-3 w-100 mb-3'>
                                        <div className="relative flex-fill">
                                            <input type="text" onChange={handleChange} name="Aadhaar_No" value={formData.Aadhaar_No} id="aadhaar" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="aadhaar" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Aadhaar No *</label>
                                        </div>

                                        <div className="relative flex-fill">
                                            <input type="file" accept='image/*' onChange={handleImageChange} name="image" id="studentimage" className="border-2 block px-2.5 pb-1.5 pt-3 w-100 text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer col-md-4" placeholder=" " />
                                            <label htmlFor="studentimage" className="absolute text-sm ms-2 text-body duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-neutral-primary px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Student Image</label>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="col-12 text-center mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-primary me-3"
                                            onClick={pageMode === "create" ? handleCreate : handleUpdate}
                                        >
                                            {pageMode === "create" ? "Create Student" : "Update Student"}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setFormData(emptyForm);
                                                setEditStudentId(null);
                                                setImage(null);
                                                setPageMode("view");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                ) :
                (
                    <>
                        <div className='d-flex justify-content-between mb-3'>
                            <h3>Student Master</h3>
                            <div className="d-flex gap-2">
                                <input type="text" onChange={(e) => setSearchTerm(e.target.value)} id="floating_outlined" className="form-control" placeholder="Search Student" style={{ width: "250px" }} />


                                <button
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setFormData(emptyForm);
                                        setEditStudentId(null);
                                        setImage(null);
                                        setPageMode("create");
                                    }}
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
                                        {filteredStudents.length > 0 ? (
                                            currentStudents.map((student, index) => (
                                                <tr key={student.student_Id}>
                                                    <td>{indexOfFirstStudent + index + 1}</td>
                                                    <td>
                                                        <img
                                                            src={`${API_BASE_URL}/image/${student.student_Id}`}
                                                            alt='student image'
                                                            className='img-fluid'
                                                            height="50px"
                                                            width="50px"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/png;base64,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';
                                                            }}
                                                        />
                                                    </td>

                                                    <td>{student.stu_FirstName} {student.stu_LastName}</td>
                                                    <td>{courses.find(c => c.course_Id === student.courseId)?.course_Name}</td>
                                                    <td>{student.email}</td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <button
                                                                className="btn btn-sm border btn-primary"
                                                                type="button"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                ⋮
                                                            </button>

                                                            <ul className="dropdown-menu">
                                                                <li className="">
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handleEdit(student)}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                                <li className="">
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => handleDelete(student)}
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
                                                <td colSpan={6} className="text-center">No Students Found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-3">
                                        <nav>
                                            <ul className="pagination">

                                                {/* Previous Button */}
                                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {/* Page Numbers */}
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <li
                                                        key={index}
                                                        className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}

                                                {/* Next Button */}
                                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>

                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}


        </div>
    )
}
