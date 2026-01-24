import { toast as toastBase, Slide } from 'react-toastify';

// Re-export the base toast function
export const toast = toastBase;

export const showSuccess = (message) => {
  toast.success(message, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
    theme: 'colored',
  });};

export const showError = (message) => {
  toast.error(message, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
    theme: 'colored',
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    position: 'top-center',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
    theme: 'colored',
  });
};

// Create toast object with all methods
const toastExports = {
  toast,
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
};

// Export everything
export default toastExports;
