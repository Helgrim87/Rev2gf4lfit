// === Script 4: Log Editing/Deletion Helpers ===

// Contains helper functions related to log entry manipulation,
// specifically checking editability and performing deletion from an array.

console.log("Script 4.js loaded: Log helper functions defined.");

/**
 * Checks if a log entry is within the editable time window (48 hours).
 * @param {object} logEntry - The log entry object. Must have an 'isoDate' property (YYYY-MM-DD).
 * @returns {boolean} - True if the entry is within 48 hours, false otherwise.
 */
function isEditable(logEntry) {
    if (!logEntry || !logEntry.isoDate) {
        console.warn("isEditable: Log entry missing isoDate property.");
        return false; // Cannot determine editability without a date
    }

    try {
        const entryTime = new Date(logEntry.isoDate).getTime(); // Get time at start of the entry day
        const currentTime = Date.now();
        const fortyEightHoursInMillis = 48 * 60 * 60 * 1000;

        // Check if the difference between now and the entry time is less than 48 hours
        return (currentTime - entryTime) < fortyEightHoursInMillis;
    } catch (error) {
        console.error("Error parsing date in isEditable:", error, logEntry.isoDate);
        return false; // Treat as not editable if date parsing fails
    }
}

/**
 * Deletes a specific log entry from a log array based on its unique ID.
 * IMPORTANT: This function *only* modifies the array in memory.
 * It does NOT handle user confirmation or saving back to Firebase.
 * It also does NOT recalculate user stats/XP based on the deletion.
 * @param {string|number} entryIdToDelete - The unique ID of the log entry to delete.
 * @param {Array<object>} currentLog - The current log array for the user.
 * @returns {Array<object>|null} - The modified log array with the entry removed,
 * or null if the entry was not found or deletion failed.
 */
function deleteLogEntry(entryIdToDelete, currentLog) {
    if (!entryIdToDelete || !Array.isArray(currentLog)) {
        console.error("deleteLogEntry: Invalid entryId or currentLog provided.");
        return null; // Indicate failure
    }

    // Find the index of the entry to delete
    // Assumes log entries have an 'entryId' property added during saving (in Script 2)
    const entryIndex = currentLog.findIndex(entry => entry.entryId === entryIdToDelete);

    if (entryIndex === -1) {
        console.warn(`deleteLogEntry: Entry with ID "${entryIdToDelete}" not found in the log.`);
        return null; // Entry not found
    }

    // Create a *new* array without the deleted entry
    const updatedLog = [
        ...currentLog.slice(0, entryIndex), // Elements before the one to delete
        ...currentLog.slice(entryIndex + 1)  // Elements after the one to delete
    ];

    console.log(`deleteLogEntry: Prepared updated log after removing entry ID "${entryIdToDelete}". New length: ${updatedLog.length}`);

    // Return the modified log array. Script 2 will handle saving.
    return updatedLog;
}

// --- Placeholder for future full editing functions ---
/*
function openEditLogModal(entryId) {
    // Logic to find entry, populate a modal form
}

function saveLogEdit(entryId, updatedData) {
    // Logic to validate, update entry, recalculate stats, save
}
*/

