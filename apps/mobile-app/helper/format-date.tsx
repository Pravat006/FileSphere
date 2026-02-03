export const formatDate = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) return 'Just now';
        return `${hours} hrs ago`;
    }
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
};