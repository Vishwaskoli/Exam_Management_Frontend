// import { CAlert } from '@coreui/react';
// import axios from 'axios';

// const api = axios.create({
// //   baseURL: 'https://payconsapi.prowesserp.in/api',  // Testing

//   //baseURL:'https://setplapi.prowesserp.in/api', //SETPL

//   //baseURL:'https://hrapi.infoinnovative.com/api', //IIpl

// //baseURL: 'https://cmklapi.iconicinfotech.com/api',  //CMKL

//   baseURL: 'http://localhost:5057/api',  // development
//   withCredentials: true,


//   //baseURL:'http://192.168.1.145/api',

// });
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Check if the JWT token is present in cookies
//       const token = document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('jwt'))
//         ?.split('=')[1];

//       if (!token) {
//         // Redirect to login if token is not found
//         window.location.href = '/#/login';
//         <CAlert>Session has expired</CAlert>

//       } else {
//         // Optionally, handle token validation issues

//         window.location.href = '/#/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
//===================================================================================
// api.js

import axios from 'axios';
// import { loadConfig, getConfig } from './configureservices';
// import { logApiError } from './frontendLogger';

let realApi = null;
let configLoaded = false;
let pendingRequests = [];
let isRedirecting = false;

// Dynamically load config and initialize Axios
async function initApi() {
  if (configLoaded) return;

  await loadConfig();
  configLoaded = true;

  const baseURL = getConfig().API_URL_MAIN + '/api';

  realApi = axios.create({
    baseURL,
    withCredentials: true,
  });

  // Optional: Response interceptor for 401
  realApi.interceptors.response.use(
    (response) => response,
    // (error) => {
    //   if (error.response && error.response.status === 401) {
    //     window.location.href = '/#/login';
    //   }
    //   return Promise.reject(error);
    // }
     (error) => {
      // Log API error
      logApiError(error);

      // Handle unauthorized
      if (error.response?.status === 401 && !isRedirecting) {
        isRedirecting = true;
        window.location.href = '/#/login';
      }
      return Promise.reject(error);
    }
  );
  
  

  // Run all queued requests
  for (const { method, params, resolve, reject } of pendingRequests) {
    realApi[method](...params).then(resolve).catch(reject);
  }

  pendingRequests = [];
}

// Proxy to delay method calls until Axios is ready
const api = new Proxy(
  {},
  {
    get(_, method) {
      return (...params) => {
        if (!configLoaded || !realApi) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({ method, params, resolve, reject });
            initApi().catch(reject);
          });
        }

        return realApi[method](...params);
      };
    },
  }
);

export default api;




