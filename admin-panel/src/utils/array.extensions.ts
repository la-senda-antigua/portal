Array.prototype.sortByKey = function<T>(this: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...this].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            return direction === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};
