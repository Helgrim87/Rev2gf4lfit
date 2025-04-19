// === Script 1: Admin Functionality ===
// Contains functions related to the Admin Panel operations.
// NOTE: These functions often rely on global variables (like currentUser, users, usersRef, achievementList)
// and DOM elements being defined and accessible, likely managed by Script 2.js.

console.log("Script 1.js loaded: Admin functions defined.");

/**
 * Toggles the visibility of elements meant only for administrators.
 * Controls elements with the 'admin-only' class.
 * Fetches elements internally and explicitly sets display style.
 * @param {boolean} isAdmin - True if the current user is an admin, false otherwise.
 */
function toggleAdminElements(isAdmin) {
    console.log(`--- toggleAdminElements called with isAdmin: ${isAdmin} ---`);

    // Fetch elements INSIDE the function to ensure fresh references
    const adminOnlyElementsNow = document.querySelectorAll('.admin-only');

    if (!adminOnlyElementsNow || adminOnlyElementsNow.length === 0) {
        console.warn("toggleAdminElements: NO elements with class 'admin-only' found in the DOM right now.");
        // Attempt to find the button container specifically if NodeList is empty initially
        const adminExtrasButtonContainer = document.querySelector('#extras-view .admin-only');
        if(adminExtrasButtonContainer) {
             adminExtrasButtonContainer.style.display = isAdmin ? 'block' : 'none';
             console.log(`toggleAdminElements: Set display='${isAdmin ? 'block' : 'none'}' for Extras tab admin button container (fallback).`);
        }
        // Still populate select if admin, even if button container wasn't found initially
         if (isAdmin) {
            if (typeof populateAdminUserSelect === 'function') {
                console.log("toggleAdminElements: Calling populateAdminUserSelect because isAdmin is true.");
                populateAdminUserSelect();
            } else {
                 console.warn("toggleAdminElements: populateAdminUserSelect function not found.");
            }
        }
        return; // Exit if no elements found by main query
    }

    console.log(`toggleAdminElements: Found ${adminOnlyElementsNow.length} elements with class 'admin-only'.`);
    console.log(`Toggling admin elements visibility: ${isAdmin}`);

    // Determine the desired display style
    const displayStyle = isAdmin ? 'block' : 'none'; // Use 'block' to explicitly show

    // Iterate over all elements found NOW with the 'admin-only' class
    adminOnlyElementsNow.forEach((el, index) => {
        if (el) {
            // Set display explicitly to 'block' or 'none'
            el.style.display = displayStyle;
            console.log(`toggleAdminElements: Set display='${el.style.display}' for element ${index} (ID: ${el.id || 'no id'}, Tag: ${el.tagName})`);
        } else {
             console.warn(`toggleAdminElements: Element at index ${index} is null/undefined during iteration.`);
        }
    });


    // If the user is an admin and the admin view elements are now potentially visible,
    // ensure the user select dropdown within the admin panel is populated.
    if (isAdmin) {
        if (typeof populateAdminUserSelect === 'function') {
            console.log("toggleAdminElements: Calling populateAdminUserSelect because isAdmin is true.");
            populateAdminUserSelect();
        } else {
             console.warn("toggleAdminElements: populateAdminUserSelect function not found.");
        }
    }
    console.log(`--- toggleAdminElements finished for isAdmin: ${isAdmin} ---`);
}

/**
 * Populates the user selection dropdown within the Admin Panel.
 */
function populateAdminUserSelect() {
    const adminSelectElement = document.getElementById('admin-user-select');
    if (!adminSelectElement) {
        console.warn("populateAdminUserSelect: adminUserSelect element not found.");
        return;
    }
     if (typeof users === 'undefined' || typeof users !== 'object' || users === null || Object.keys(users).length === 0) {
        console.warn("populateAdminUserSelect: Global 'users' object is empty or invalid.");
        adminSelectElement.innerHTML = '<option value="" disabled selected>Ingen brukere</option>';
        return;
    }
    console.log("Populating admin user select.");
    const userKeys = Object.keys(users).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const currentSelection = adminSelectElement.value;
    adminSelectElement.innerHTML = '<option value="" disabled>-- Velg bruker --</option>';
    let foundSelection = false;
    userKeys.forEach(username => {
        const option = document.createElement('option');
        option.value = username; option.textContent = username;
        adminSelectElement.appendChild(option);
        if (username === currentSelection) { foundSelection = true; }
    });
    if (foundSelection && userKeys.includes(currentSelection)) { adminSelectElement.value = currentSelection; }
    else { adminSelectElement.value = ""; }
     if (!adminSelectElement.value) {
        const placeholderOption = adminSelectElement.querySelector('option[disabled]');
        if (placeholderOption) placeholderOption.selected = true;
    }
}

/**
 * Displays a temporary message within the Admin Panel.
 * @param {string} targetElementId - The ID of the <p> tag where the message should appear.
 * @param {string} message - The message text.
 * @param {boolean} [success=true] - If true, styles the message as success (green), otherwise as error (red).
 */
function displayAdminActionMessage(targetElementId, message, success = true) {
    const messageElement = document.getElementById(targetElementId);
    if (!messageElement) {
        // Log the missing ID clearly
        console.error(`displayAdminActionMessage: Element with ID "${targetElementId}" not found.`);
        // Optionally show a generic alert as fallback
        // alert(`Admin Action: ${message}`);
        return;
    }
    messageElement.textContent = message;
    messageElement.className = `text-xs italic mt-2 h-4 ${success ? 'text-green-500' : 'text-red-500'}`;
    setTimeout(() => { if (messageElement) messageElement.textContent = ''; }, 4000);
}

/**
 * Handles the logic for adding a new user via the Admin Panel.
 */
function adminAddNewUser() {
    // Use existing message ID: 'admin-add-user-message'
    const messageId = 'admin-add-user-message';
    if (typeof firebaseInitialized === 'undefined' || !firebaseInitialized || typeof usersRef === 'undefined' || !usersRef) {
        displayAdminActionMessage(messageId, "Firebase ikke klar.", false); return;
    }
    if (typeof currentUser === 'undefined' || currentUser !== "Helgrim") {
        displayAdminActionMessage(messageId, "Uautorisert handling.", false); return;
    }
    const usernameInputElement = document.getElementById('admin-new-username');
    if (!usernameInputElement) { console.error("Admin new username input not found"); displayAdminActionMessage(messageId, "Intern feil: Fant ikke brukernavn-felt.", false); return; }
    const newUsername = usernameInputElement.value.trim();
    if (!newUsername) { displayAdminActionMessage(messageId, "Brukernavn kan ikke være tomt.", false); return; }
    if (typeof users !== 'undefined' && Object.keys(users).some(existingUser => existingUser.toLowerCase() === newUsername.toLowerCase())) {
        displayAdminActionMessage(messageId, `Bruker "${newUsername}" finnes allerede.`, false); return;
    }
    console.log(`Admin preparing to add user: ${newUsername}`);
    let defaultUserData;
    if (typeof getDefaultUsers === 'function') { defaultUserData = getDefaultUsers()["Klinkekule"]; }
    else { console.error("adminAddNewUser: getDefaultUsers function is not defined."); defaultUserData = { xp: 0, level: 1, log: [], theme: 'klinkekule', lastWorkoutDate: null, streak: 0, snooped: false, lastLogin: null, achievements: [], stats: { totalWorkouts: 0, totalKm: 0, totalVolume: 0, themesTried: ['klinkekule'], timesSnooped: 0, lastMood: null, importedData: false, exportedData: false } }; }
    const newUserObject = JSON.parse(JSON.stringify(defaultUserData));
    newUserObject.theme = 'klinkekule'; newUserObject.stats.themesTried = ['klinkekule']; newUserObject.log = []; newUserObject.achievements = [];
    if (typeof getLevelFromTotalXP === 'function') { newUserObject.level = getLevelFromTotalXP(newUserObject.xp); }
    else { console.warn("adminAddNewUser: getLevelFromTotalXP function not found. Setting level to 1."); newUserObject.level = 1; }
    usersRef.child(newUsername).set(newUserObject)
        .then(() => { console.log(`Admin successfully added user: ${newUsername}`); displayAdminActionMessage(messageId, `Bruker "${newUsername}" lagt til!`, true); if (usernameInputElement) usernameInputElement.value = ''; })
        .catch(error => { console.error(`Admin failed to add user ${newUsername}:`, error); displayAdminActionMessage(messageId, `Feil ved tillegging: ${error.message}`, false); });
}


/**
 * Handles the logic for adjusting a user's XP via the Admin Panel.
 */
function adminAdjustXp() {
    // Use existing message ID: 'admin-action-message'
    const messageId = 'admin-action-message';
     if (typeof firebaseInitialized === 'undefined' || !firebaseInitialized || typeof usersRef === 'undefined' || !usersRef) { displayAdminActionMessage(messageId, "Firebase ikke klar.", false); return; }
     if (typeof currentUser === 'undefined' || currentUser !== "Helgrim") { displayAdminActionMessage(messageId, "Uautorisert handling.", false); return; }
    const userSelectElement = document.getElementById('admin-user-select');
    const xpAmountInputElement = document.getElementById('admin-xp-amount');
    if (!userSelectElement || !xpAmountInputElement) { console.error("Admin Adjust XP: Missing required DOM elements."); displayAdminActionMessage(messageId, "Intern feil: Fant ikke admin-elementer.", false); return; }
    if (typeof getLevelFromTotalXP !== 'function') { console.error("Admin Adjust XP: getLevelFromTotalXP function not found."); displayAdminActionMessage(messageId, "Intern feil: Nivåberegning mangler.", false); return; }
    const targetUsername = userSelectElement.value;
    const xpAmountStr = xpAmountInputElement.value;
    if (!targetUsername) { displayAdminActionMessage(messageId, "Velg en bruker.", false); return; }
    if (!xpAmountStr) { displayAdminActionMessage(messageId, "Skriv inn XP-mengde.", false); return; }
    const xpAmount = parseInt(xpAmountStr, 10);
    if (isNaN(xpAmount)) { displayAdminActionMessage(messageId, "Ugyldig XP-mengde (må være et tall).", false); return; }
    const targetUserRef = usersRef.child(targetUsername);
    targetUserRef.child('xp').once('value', (snapshot) => {
        const currentXp = snapshot.val() || 0;
        const newXp = Math.max(0, currentXp + xpAmount);
        const newLevel = getLevelFromTotalXP(newXp);
        console.log(`Admin: Setting XP for ${targetUsername} from ${currentXp} to ${newXp}. New level: ${newLevel}`);
        targetUserRef.update({ xp: newXp, level: newLevel })
            .then(() => {
                const actionText = xpAmount >= 0 ? 'Ga' : 'Fjernet'; const amountText = Math.abs(xpAmount); const preposition = xpAmount >= 0 ? 'til' : 'fra';
                displayAdminActionMessage(messageId, `${actionText} ${amountText} XP ${preposition} ${targetUsername}. Ny total: ${newXp} (Nivå ${newLevel})`, true);
                if (xpAmountInputElement) xpAmountInputElement.value = '';
            })
            .catch(error => { console.error(`Admin: Failed to update XP/level for ${targetUsername}:`, error); displayAdminActionMessage(messageId, `Feil ved oppdatering av XP for ${targetUsername}.`, false); });
    }).catch(error => { console.error(`Admin: Failed to read current XP for ${targetUsername}:`, error); displayAdminActionMessage(messageId, `Kunne ikke hente nåværende XP for ${targetUsername}.`, false); });
}

// --- NEW ADMIN FUNCTIONS ---

/**
 * Resets a selected user's data back to default values in Firebase.
 * Triggered by the "Tilbakestill Bruker" button listener (in Script 2).
 */
function adminResetUser() {
    // *** Use existing message ID 'admin-action-message' for this section ***
    const messageId = 'admin-action-message';

    if (typeof firebaseInitialized === 'undefined' || !firebaseInitialized || typeof usersRef === 'undefined' || !usersRef) {
        displayAdminActionMessage(messageId, "Firebase ikke klar.", false); return;
    }
    if (typeof currentUser === 'undefined' || currentUser !== "Helgrim") {
        displayAdminActionMessage(messageId, "Uautorisert.", false); return;
    }
    const userSelectElement = document.getElementById('admin-user-select');
    if (!userSelectElement) { displayAdminActionMessage(messageId, "Velg bruker-element ikke funnet.", false); return; }

    const targetUsername = userSelectElement.value;
    if (!targetUsername) {
        displayAdminActionMessage(messageId, "Velg en bruker å tilbakestille.", false); return;
    }
    if (targetUsername === "Helgrim") {
         displayAdminActionMessage(messageId, "Kan ikke tilbakestille admin-brukeren.", false); return;
    }

    // Confirmation dialog
    if (!confirm(`Er du HELT SIKKER på at du vil tilbakestille brukeren "${targetUsername}"? All XP, logg og achievements vil bli slettet!`)) {
        return; // Abort if user cancels
    }

    console.log(`Admin: Attempting to reset user ${targetUsername}`);

    // Get the default user structure (use Klinkekule as base, keep original theme if possible)
    let defaultUserData;
    if (typeof getDefaultUsers === 'function') {
        defaultUserData = getDefaultUsers()["Klinkekule"]; // Base structure
    } else {
        console.error("adminResetUser: getDefaultUsers function not defined!");
        displayAdminActionMessage(messageId, "Intern feil: Kan ikke hente standarddata.", false);
        return; // Cannot proceed without defaults
    }

    const userToReset = JSON.parse(JSON.stringify(defaultUserData)); // Deep clone defaults

    // Preserve the user's original theme if it exists, otherwise use default
    userToReset.theme = users[targetUsername]?.theme || 'klinkekule';
    userToReset.stats.themesTried = [userToReset.theme]; // Reset themes tried to just the current one
    // Ensure level is reset according to 0 XP
    if(typeof getLevelFromTotalXP === 'function') {
        userToReset.level = getLevelFromTotalXP(0);
    } else {
        userToReset.level = 0; // Fallback if function missing
    }


    // Set the user's data in Firebase to the reset object
    usersRef.child(targetUsername).set(userToReset)
        .then(() => {
            console.log(`Admin successfully reset user: ${targetUsername}`);
            displayAdminActionMessage(messageId, `Bruker "${targetUsername}" er tilbakestilt!`, true);
            // Firebase listener should update UI
        })
        .catch(error => {
            console.error(`Admin failed to reset user ${targetUsername}:`, error);
            displayAdminActionMessage(messageId, `Feil ved tilbakestilling: ${error.message}`, false);
        });
}

/**
 * Populates the achievement list in the admin panel for the selected user.
 * Called when the admin user selection changes.
 */
function adminPopulateAchievements() {
    const userSelectElement = document.getElementById('admin-user-select');
    const achievementsListDiv = document.getElementById('admin-achievements-list');
    const saveButton = document.getElementById('admin-save-achievements-button');

    if (!userSelectElement || !achievementsListDiv || !saveButton) {
        console.warn("adminPopulateAchievements: Missing required DOM elements.");
        if(achievementsListDiv) achievementsListDiv.innerHTML = '<p class="italic text-sm text-red-500">Feil: UI-elementer mangler.</p>';
        return;
    }
    // Ensure achievementList is available (from Script Level names)
    if (typeof achievementList === 'undefined' || !Array.isArray(achievementList)) {
        console.error("adminPopulateAchievements: achievementList is not available.");
        achievementsListDiv.innerHTML = '<p class="text-red-500">Feil: Achievement-liste mangler.</p>';
        saveButton.disabled = true;
        return;
    }

    const targetUsername = userSelectElement.value;

    if (!targetUsername || !users[targetUsername]) {
        achievementsListDiv.innerHTML = '<p class="italic text-sm">Velg en bruker for å se/endre achievements.</p>';
        saveButton.disabled = true; // Disable save if no user selected
        return;
    }

    const userAchievements = users[targetUsername].achievements || [];
    console.log(`Populating achievements for admin editing: ${targetUsername}`);

    achievementsListDiv.innerHTML = achievementList.map(ach => {
        const isChecked = userAchievements.includes(ach.id);
        // Use ach.id as the value for the checkbox
        return `
            <label class="block hover:bg-white hover:bg-opacity-5 p-1 rounded cursor-pointer">
                <input type="checkbox" value="${ach.id}" ${isChecked ? 'checked' : ''} class="admin-achievement-checkbox align-middle mr-2">
                <span class="${isChecked ? 'font-semibold text-accent' : ''}">${ach.name}</span>
                <span class="achievement-desc block text-xs">${ach.description}</span>
            </label>
        `;
    }).join('');

    saveButton.disabled = false; // Enable save button now that list is populated
}

/**
 * Saves the changes made to achievements in the admin panel.
 * Triggered by the "Lagre Achievements" button listener (in Script 2).
 */
function adminSaveChanges() {
    // Use existing message ID: 'admin-achievements-message'
    const messageId = 'admin-achievements-message';

    if (typeof firebaseInitialized === 'undefined' || !firebaseInitialized || typeof usersRef === 'undefined' || !usersRef) {
        displayAdminActionMessage(messageId, "Firebase ikke klar.", false); return;
    }
    if (typeof currentUser === 'undefined' || currentUser !== "Helgrim") {
        displayAdminActionMessage(messageId, "Uautorisert.", false); return;
    }
    const userSelectElement = document.getElementById('admin-user-select');
    const achievementsListDiv = document.getElementById('admin-achievements-list');
    if (!userSelectElement || !achievementsListDiv) {
        displayAdminActionMessage(messageId, "Nødvendige elementer mangler.", false); return;
    }

    const targetUsername = userSelectElement.value;
    if (!targetUsername) {
        displayAdminActionMessage(messageId, "Velg en bruker først.", false); return;
    }

    const checkboxes = achievementsListDiv.querySelectorAll('.admin-achievement-checkbox');
    const updatedAchievements = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            updatedAchievements.push(checkbox.value); // Store the achievement ID
        }
    });

    console.log(`Admin: Saving achievements for ${targetUsername}:`, updatedAchievements);

    // Update the achievements array in Firebase for the target user
    usersRef.child(targetUsername).child('achievements').set(updatedAchievements)
        .then(() => {
            console.log(`Admin successfully updated achievements for: ${targetUsername}`);
            displayAdminActionMessage(messageId, `Achievements for "${targetUsername}" er lagret!`, true);
            // Update local cache as well (Firebase listener should also catch this)
            if (users[targetUsername]) {
                users[targetUsername].achievements = updatedAchievements;
                // If the currently logged-in user's achievements were changed by admin, re-render their list
                if (targetUsername === currentUser && typeof renderAchievements === 'function') {
                    renderAchievements();
                }
            }
        })
        .catch(error => {
            console.error(`Admin failed to save achievements for ${targetUsername}:`, error);
            displayAdminActionMessage(messageId, `Feil ved lagring: ${error.message}`, false);
        });
}


/**
 * Deletes a selected user from Firebase after confirmation.
 * Triggered by the "Slett Valgt Bruker" button listener (in Script 2).
 */
function adminDeleteUser() {
     // Use existing message ID: 'admin-delete-user-message'
     const messageId = 'admin-delete-user-message';

     if (typeof firebaseInitialized === 'undefined' || !firebaseInitialized || typeof usersRef === 'undefined' || !usersRef) {
        displayAdminActionMessage(messageId, "Firebase ikke klar.", false); return;
    }
    if (typeof currentUser === 'undefined' || currentUser !== "Helgrim") {
        displayAdminActionMessage(messageId, "Uautorisert.", false); return;
    }
    const userSelectElement = document.getElementById('admin-user-select');
    if (!userSelectElement) { displayAdminActionMessage(messageId, "Velg bruker-element ikke funnet.", false); return; }

    const targetUsername = userSelectElement.value;
    if (!targetUsername) {
        displayAdminActionMessage(messageId, "Velg en bruker å slette.", false); return;
    }
    if (targetUsername === "Helgrim") {
         displayAdminActionMessage(messageId, "Kan ikke slette admin-brukeren.", false); return;
    }
     if (targetUsername === currentUser) {
          displayAdminActionMessage(messageId, "Kan ikke slette deg selv.", false); return;
     }


    // Double confirmation dialog
    if (!confirm(`Er du HELT SIKKER på at du vil SLETTE brukeren "${targetUsername}"? Dette kan IKKE angres!`)) {
        return; // Abort if user cancels first confirmation
    }
     if (!confirm(`SISTE ADVARSEL: Er du 100% sikker på at du vil permanent slette "${targetUsername}" og all dataen?`)) {
        return; // Abort if user cancels second confirmation
    }

    console.log(`Admin: Attempting to DELETE user ${targetUsername}`);

    // Remove the user's node from Firebase
    usersRef.child(targetUsername).remove()
        .then(() => {
            console.log(`Admin successfully DELETED user: ${targetUsername}`);
            displayAdminActionMessage(messageId, `Bruker "${targetUsername}" er slettet!`, true);
            // Clear selection in admin dropdown
            userSelectElement.value = '';
            // Clear achievement list if it was showing the deleted user
             const achievementsListDiv = document.getElementById('admin-achievements-list');
              const saveButton = document.getElementById('admin-save-achievements-button');
             if (achievementsListDiv) achievementsListDiv.innerHTML = '<p class="italic text-sm">Velg en bruker for å se/endre achievements.</p>';
             if (saveButton) saveButton.disabled = true;

            // Firebase listener should update UI (user lists etc.)
        })
        .catch(error => {
            console.error(`Admin failed to DELETE user ${targetUsername}:`, error);
            displayAdminActionMessage(messageId, `Feil ved sletting: ${error.message}`, false);
        });
}

// --- END NEW ADMIN FUNCTIONS ---
