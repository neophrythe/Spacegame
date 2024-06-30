import { message } from 'antd';

export const handleError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message.error(`Error: ${error.response.data.message || 'An error occurred'}`);
    } else if (error.request) {
        // The request was made but no response was received
        message.error('No response received from server. Please check your internet connection.');
    } else {
        // Something happened in setting up the request that triggered an Error
        message.error('An unexpected error occurred. Please try again later.');
    }
    console.error('Error details:', error);
};