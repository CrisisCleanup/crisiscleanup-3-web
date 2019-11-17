export function getErrorMessage(error) {
    if (error.response.status === 500) {
        return 'An unexpected error occurred'
    }
    return error.response.data.errors[0].message[0];
}