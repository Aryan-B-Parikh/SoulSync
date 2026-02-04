/**
 * Response Formatter
 * Maps Prisma 'id' to Mongoose-style '_id' for frontend compatibility
 */

const toMongo = (data) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(toMongo);
    }

    if (typeof data === 'object') {
        // Clone to avoid mutating original if needed, or just return new object
        const newObj = { ...data };

        // Map id to _id
        if (newObj.id && !newObj._id) {
            newObj._id = newObj.id;
        }

        // Recursively map nested objects (like chat.messages or user)
        for (const key in newObj) {
            if (typeof newObj[key] === 'object' && newObj[key] !== null) {
                // Avoid moments/dates
                if (!(newObj[key] instanceof Date)) {
                    newObj[key] = toMongo(newObj[key]);
                }
            }
        }
        return newObj;
    }

    return data;
};

module.exports = { toMongo };
