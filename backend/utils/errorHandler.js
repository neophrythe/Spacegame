import { message } from 'antd';

export const handleError = (error) => {
    if (error.response) {
        message.error(`Error: ${error.response.data.message || 'An error occurred'}`);
    } else if (error.request) {
        message.error('No response received from server. Please check your internet connection.');
    } else {
        message.error('An unexpected error occurred. Please try again later.');
    }
    console.error('Error details:', error);
};