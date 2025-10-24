export function calculatePagination(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return { offset, limit };
}

export function validatePagination(page: number, limit: number) {
    if (page < 1 || limit < 1) {
        throw new Error('Page and limit must be greater than 0');
    }
}