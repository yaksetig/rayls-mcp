/**
 * Utility function to create an error response
 * @param message The error message
 * @returns A ToolResultSchema with the error message
 */
export const createErrorResponse = (message) => {
    return {
        content: [{
                type: "text",
                text: message
            }],
        isError: true
    };
};
/**
 * Utility function to create a success response
 * @param message The success message
 * @returns A ToolResultSchema with the success message
 */
export const createSuccessResponse = (message) => {
    return {
        content: [{
                type: "text",
                text: message
            }],
        isError: false
    };
};
