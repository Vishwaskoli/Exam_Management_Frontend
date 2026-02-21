// Company Id 
export const getCompanyId = () => {
  return localStorage.getItem('Company_Code');
};

//Finyear Code 

export const Finyear =()=>{
  return localStorage.getItem('Finyear');

}

//Created By 
export const createdby = ()=>{
  return localStorage.getItem('userid');
}

//Employee Id 
export const empid = ()=>{
  return localStorage.getItem('empid');
}

//Company Name 
export const CompanyName =()=> {
  return localStorage.getItem('Company_Name');
}

// Remove commas from a string
export const removeCommas = (value) => {
    return value.replace(/,/g, '');
  };
  

  // Remove special characters (only alphanumeric characters and spaces allowed)
  export const removeSpecialChars = (value) => {
    return value.replace(/[^a-zA-Z0-9\s]/g, ''); // Removes anything that's not a letter, number, or space
  };
  
  // Allow only digits
  export const allowOnlyDigits = (value) => {
    return value.replace(/\D/g, ''); // Removes any non-digit character
  };
  
  // Allow only letters (case-insensitive)
  export const allowOnlyLetters = (value) => {
    return value.replace(/[^a-zA-Z]/g, ''); // Removes anything that's not a letter
  };

  // Allow only letters, spaces and underscores
export const allowLettersSpacesUnderscores = (value) => {
  return value.replace(/[^a-zA-Z\s_]/g, '');
};

  // Remove leading spaces from a string at starting 
export const removeLeadingSpaces = (value) => {
  return value.replace(/^\s+/, '');
};

// Utility to capitalize the first word
export const capitalizeFirstWord = (value) => {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
// Utility function to allow only letters and spaces (no special characters)
export const formatInput = (value) => {
  // Remove leading spaces
  value = value.replace(/^\s+/, '');
  // Allow only letters and spaces
  return value.replace(/[^a-zA-Z\s]/g, '');
};

  export const formatMonthYear = (value) => {
    const date = new Date(value + '-01'); 
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  export const formatDateYMD = (dateStr)=> {
  const dateObj = new Date(dateStr);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

export const formatDateDMY = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  const dateObj = new Date(`${year}-${month}-${day}`); // Convert to yyyy-mm-dd format
  const formattedDay = String(dateObj.getDate()).padStart(2, '0');
  const formattedMonth = dateObj.toLocaleString('en-US', { month: 'long' });
  const formattedYear = dateObj.getFullYear();

  return `${formattedDay}-${formattedMonth}-${formattedYear}`;
};

  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }
export const formatCurrencyINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2, // optional: remove decimal if not needed
  }).format(amount);
};

  export const formatDMY=(dateStr)=> {
    const date = new Date(dateStr);
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Convert number to words (Indian Numbering System)
export const convertNumberToWordsIndian = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  const n = parseFloat(num);
  if (n === 0) return "Zero";

  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const format = (val, suffix) => {
    if (val === 0) return "";
    let res = "";
    if (val > 19) {
      res += tens[Math.floor(val / 10)] + " " + single[val % 10];
    } else if (val > 9) {
      res += double[val - 10];
    } else {
      res += single[val];
    }
    return res.trim() + " " + suffix + " ";
  };

  let words = "";
  words += format(Math.floor(n / 10000000), "Crore");
  words += format(Math.floor((n / 100000) % 100), "Lakh");
  words += format(Math.floor((n / 1000) % 100), "Thousand");
  words += format(Math.floor((n / 100) % 10), "Hundred");

  const rem = Math.floor(n % 100);
  if (rem > 0) {
    if (words !== "") words += "and ";
    if (rem > 19) {
      words += tens[Math.floor(rem / 10)] + " " + single[rem % 10];
    } else if (rem > 9) {
      words += double[rem - 10];
    } else {
      words += single[rem];
    }
  }

  return "Rupees " + words.trim() + " Only";
};



// 🧱 Component Naming List
// Component Type	Naming Example	Pattern
// Input	username-login-input	<name>-<filename>-input
// Password Input	password-login-input	<name>-<filename>-input
// Select / Dropdown	department-master-select	<name>-<filename>-select
// Button	save-basicdetails-btn	<name>-<filename>-btn
// Add Button	add-company-btn	<name>-<filename>-btn
// Delete Button	delete-user-btn	<name>-<filename>-btn
// Edit Button	edit-department-btn	<name>-<filename>-btn
// Link	forgotpassword-login-link	<name>-<filename>-link
// Checkbox	terms-registration-checkbox	<name>-<filename>-checkbox
// Radio Button	gender-employee-radio	<name>-<filename>-radio
// Label	username-login-label	<name>-<filename>-label
// Icon	user-navbar-icon	<name>-<filename>-icon
// Table	company-master-table	<name>-<filename>-table
// Table Row	row-company-table	<name>-<filename>-table
// Modal / Popup	confirmation-master-modal	<name>-<filename>-modal
// Card	profile-dashboard-card	<name>-<filename>-card
// Tooltip	edit-company-tooltip	<name>-<filename>-tooltip
// Badge	status-user-badge	<name>-<filename>-badge
// Nav Item	masters-sidebar-navitem	<name>-<filename>-navitem
// Sidebar Link	company-sidebar-link	<name>-<filename>-link
// Tab	overview-dashboard-tab	<name>-<filename>-tab
// Form Group / Section	personalinfo-employee-section	<name>-<filename>-section
// Switch / Toggle	active-user-switch	<name>-<filename>-switch
// 🧩 Examples in JSX
// <CFormInput id="username-login-input" placeholder="Username" />

// <CButton id="save-basicdetails-btn">Save</CButton>

// <CLink id="forgotpassword-login-link" href="/forgot">Forgot Password?</CLink>

// <CFormSelect id="department-master-select">
//   <option>IT</option>
// </CFormSelect>

// <CIcon id="user-navbar-icon" icon={cilUser} />

// <CModal id="confirmation-master-modal" visible={showModal}>...</CModal>

// Location Utility
export const getCurrentLocationPromise = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Unable to retrieve location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "User denied the request for Geolocation. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
          default:
            msg = "An unknown error occurred while retrieving location.";
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: timeout, maximumAge: 0 }
    );
  });
};

// ✅ Quick Rules

// Use lowercase

// Separate words with hyphens (-)

// Always follow: <name>-<filename>-<element>

// Keep name meaningful (save, username, department, etc.)

// filename = React component or page name (login, master, dashboard, etc.)

// 🔥 Example Summary
// Page / File	Element	Example ID
// Login	Username Input	username-login-input
// Login	Password Input	password-login-input
// Login	Submit Button	submit-login-btn
// Master	Add Company Button	add-company-btn
// Master	Department Dropdown	department-master-select
// Dashboard	Profile Card	profile-dashboard-card
// Navbar	User Icon	user-navbar-icon
// Modal	Confirmation Dialog	confirmation-master-modal
  


  