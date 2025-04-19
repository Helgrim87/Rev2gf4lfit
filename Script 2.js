// === Script 2: Core Application Logic & UI Interaction ===
// This script orchestrates the main application flow, handles UI updates,
// user interactions, and integrates functionalities from other scripts.
// Includes logic for 48-hour log entry deletion.
// Adds logic to trigger achievement pop-up.
// Calls chart rendering functions from Script 5.js.

console.log("Script 2.js loaded: Core logic starting.");

// --- Global State Variables ---
let currentUser = null; // Stores the currently logged-in username
let users = {};         // Object to hold all user data fetched from Firebase
let currentWorkout = []; // Array to hold activities added during the current session
let retroSoundEnabled = false; // Flag for enabling/disabling sound effects
let synth = null;       // Tone.js synthesizer instance
let firebaseInitialized = false; // Flag indicating if Firebase connection is established
let db = null;          // Firebase Realtime Database instance
let usersRef = null;    // Firebase reference to the 'users' node
let chatRef = null;     // Firebase reference to the 'chat' node
let initialDataLoaded = false; // Flag indicating if initial user data has been loaded
let chatListenerAttached = false; // Flag to prevent attaching multiple chat listeners
let isDemoMode = false; // Set to true for local testing without Firebase
let currentActiveView = null; // Track the currently active view

// --- DOM Element Variables ---
// Declared here, assigned in initializeDOMElements
let body, appContent, loginForm, userSelect, passwordInput, loginButton, statusDisplay, loggedInUserDisplay, logoutButton, notificationArea, themeButtons, viewButtons, viewSections, workoutForm, exerciseTypeSelect, customExerciseNameField, customExerciseInput, kgField, repsField, setsField, kmField, currentSessionList, completeWorkoutButton, levelDisplay, levelEmojiDisplay, xpCurrentDisplay, xpNextLevelDisplay, xpTotalDisplay, xpProgressBar, logEntriesContainer, userListDisplay, levelUpIndicator, levelUpNewLevel, mascotElement, mascotMessage, streakCounter, retroModeButton, dailyTipContainer, snoopModal, snoopModalTitle, snoopModalLog, closeSnoopModalButton, saveDataButton, exportDataButton, importDataButton, importFileInput, dataActionMessage, motivationButton, demoModeIndicator, checkStatButton, scoreboardList, achievementsListContainer, workoutCommentInput, moodSelector, adminOnlyElements, adminUserSelect, adminXpAmountInput, adminGiveXpButton, adminActionMessage, adminNewUsernameInput, adminAddUserButton, adminAddUserMessage, adminExtrasButton;
// New Admin Elements
let adminResetUserButton, adminAchievementsListDiv, adminSaveAchievementsButton, adminAchievementsMessage, adminDeleteUserButton, adminDeleteUserMessage;
// Chat elements (will be used by functions in Script 3, but fetched here)
let chatView, chatMessages, chatForm, chatInput, chatLoadingMsg;
// Nikko's special button
let nikkoBuyXpButton;
// Achievement Pop-up
let achievementIndicator, achievementIndicatorNameSpan;
// XP Chart Elements (Canvas elements are fetched inside Script 5)


// --- Anti-Cheat Limits ---
const MAX_WEIGHT_KG = 250;
const MAX_REPS = 200;
const MAX_KM_WALK = 50; // Per activity log, not per day total yet

// --- Initialization ---

/**
 * Initializes the Firebase connection using config from Script Level names.js
 * and sets up database references.
 */
function initializeFirebaseConnection() {
    // Assumes firebaseConfig is defined in Script Level names.js
    if (typeof firebaseConfig === 'undefined') {
        console.error("Firebase config is missing! Ensure Script Level names.js is loaded first.");
        alert("Kritisk feil: Firebase-konfigurasjon mangler.");
        isDemoMode = true; // Force demo mode if config is missing
        if (demoModeIndicator) demoModeIndicator.textContent = "Demo Mode - Config Feil!";
        return;
    }

    try {
        // Check if Firebase is already initialized (relevant for potential hot-reloads)
        if (!firebase.apps.length) {
             firebase.initializeApp(firebaseConfig);
             console.log("Firebase initialized successfully.");
        } else {
             firebase.app(); // if already initialized, use that app
             console.log("Firebase already initialized.");
        }

        db = firebase.database();
        usersRef = db.ref("users");
        chatRef = db.ref("chat"); // Reference for chat module
        firebaseInitialized = true;
        if (demoModeIndicator) demoModeIndicator.textContent = "Live Mode - Koblet til Firebase";

        // Start loading data and listening for changes
        loadUsersFromFirebase();
        // Initialize chat listener only when chat view is activated
        // initializeChat(); // Defined in Script 3, called by setActiveView

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        if (demoModeIndicator) demoModeIndicator.textContent = "Live Mode - Firebase Feil!";
        alert("Kunne ikke koble til Firebase. Laster standarddata (ingen lagring).");
        isDemoMode = true; // Fallback to demo mode
        loadDefaultUsersLocally(); // Load defaults if Firebase fails
        processLoadedUsers(); // Process the default data
    }
}

/**
 * Fetches references to all necessary DOM elements.
 * Should be called after the DOM is fully loaded.
 */
function initializeDOMElements() {
    console.log("Attempting to initialize DOM elements...");
    body = document.body;
    appContent = document.getElementById('app-content');
    loginForm = document.getElementById('login-form');
    userSelect = document.getElementById('user-select');
    passwordInput = document.getElementById('password-input');
    loginButton = document.getElementById('login-btn');
    statusDisplay = document.getElementById('status');
    loggedInUserDisplay = document.getElementById('logged-in-user');
    logoutButton = document.getElementById('logout-button');
    notificationArea = document.getElementById('notification-area');
    themeButtons = document.querySelectorAll('.theme-button');
    viewButtons = document.querySelectorAll('.view-button');
    viewSections = document.querySelectorAll('.view-section');
    workoutForm = document.getElementById('workout-form');
    exerciseTypeSelect = document.getElementById('exercise-type');
    customExerciseNameField = document.getElementById('custom-exercise-name-field');
    customExerciseInput = document.getElementById('exercise');
    kgField = document.querySelector('.form-field-kg');
    repsField = document.querySelector('.form-field-reps');
    setsField = document.querySelector('.form-field-sets');
    kmField = document.querySelector('.form-field-km');
    currentSessionList = document.getElementById('current-session-list');
    completeWorkoutButton = document.getElementById('complete-workout-button');
    levelDisplay = document.getElementById('level-display');
    levelEmojiDisplay = document.getElementById('level-emoji');
    xpCurrentDisplay = document.getElementById('xp-current');
    xpNextLevelDisplay = document.getElementById('xp-next-level');
    xpTotalDisplay = document.getElementById('xp-total');
    xpProgressBar = document.getElementById('xp-progress-bar');
    logEntriesContainer = document.getElementById('log-entries'); // Needed for delete listener
    userListDisplay = document.getElementById('user-list-display');
    levelUpIndicator = document.getElementById('level-up-indicator');
    levelUpNewLevel = document.getElementById('level-up-new-level');
    mascotElement = document.getElementById('mascot');
    mascotMessage = document.getElementById('mascot-message');
    streakCounter = document.getElementById('streak-counter');
    retroModeButton = document.getElementById('retro-mode-button');
    dailyTipContainer = document.getElementById('daily-tip-container');
    snoopModal = document.getElementById('snoop-modal');
    snoopModalTitle = document.getElementById('snoop-modal-title');
    snoopModalLog = document.getElementById('snoop-modal-log');
    closeSnoopModalButton = document.getElementById('close-snoop-modal');
    saveDataButton = document.getElementById('save-data-button'); // Note: Button might be less relevant in live mode
    exportDataButton = document.getElementById('export-data-button');
    importDataButton = document.getElementById('import-data-button');
    importFileInput = document.getElementById('import-file-input');
    dataActionMessage = document.getElementById('data-action-message');
    motivationButton = document.getElementById('motivation-button');
    demoModeIndicator = document.getElementById('demo-mode-indicator');
    checkStatButton = document.getElementById('check-stat-button');
    scoreboardList = document.getElementById('scoreboard-list');
    achievementsListContainer = document.getElementById('achievements-list');
    workoutCommentInput = document.getElementById('workout-comment');
    moodSelector = document.querySelector('.mood-selector');

    // Admin Elements (fetched here, used by Script 1 functions)
    adminOnlyElements = document.querySelectorAll('.admin-only'); // NodeList of elements to hide/show (now just the button container in Extras)
    adminUserSelect = document.getElementById('admin-user-select');
    adminXpAmountInput = document.getElementById('admin-xp-amount');
    adminGiveXpButton = document.getElementById('admin-give-xp-button');
    adminActionMessage = document.getElementById('admin-action-message'); // For XP/Reset actions
    adminNewUsernameInput = document.getElementById('admin-new-username');
    adminAddUserButton = document.getElementById('admin-add-user-button');
    adminAddUserMessage = document.getElementById('admin-add-user-message');
    adminExtrasButton = document.getElementById('admin-extras-button'); // The button in Extras tab

    // Fetch NEW Admin Elements
    adminResetUserButton = document.getElementById('admin-reset-user-button');
    adminAchievementsListDiv = document.getElementById('admin-achievements-list');
    adminSaveAchievementsButton = document.getElementById('admin-save-achievements-button');
    adminAchievementsMessage = document.getElementById('admin-achievements-message');
    adminDeleteUserButton = document.getElementById('admin-delete-user-button');
    adminDeleteUserMessage = document.getElementById('admin-delete-user-message');


    // Chat Elements (fetched here, used by Script 3 functions)
    chatView = document.getElementById('chat-view');
    chatMessages = document.getElementById('chat-messages');
    chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
    chatLoadingMsg = document.getElementById('chat-loading-msg');

    // Nikko's Button
    nikkoBuyXpButton = document.getElementById('nikko-buy-xp-button');

    // Fetch Achievement Pop-up Elements
    achievementIndicator = document.getElementById('achievement-unlocked-indicator');
    if (achievementIndicator) {
        achievementIndicatorNameSpan = achievementIndicator.querySelector('.ach-name');
        if (!achievementIndicatorNameSpan) {
             console.warn("Achievement indicator name span (.ach-name) not found inside #achievement-unlocked-indicator.");
        }
    } else {
         console.warn("Achievement indicator element (#achievement-unlocked-indicator) not found.");
    }


    // Basic check for essential elements
    if (!appContent || !loginForm || !workoutForm || !viewSections || viewSections.length === 0) {
         console.error("CRITICAL ERROR: Essential layout or form elements were NOT found!");
         alert("Kritisk feil: Nødvendige elementer mangler på siden.");
    } else {
        console.log("Essential DOM elements initialized successfully.");
    }
    // Check if new admin elements were found (important for listeners)
    if (!adminResetUserButton || !adminAchievementsListDiv || !adminSaveAchievementsButton || !adminDeleteUserButton) {
         console.warn("One or more NEW admin UI elements (reset, achievements, delete) were not found. Check HTML IDs.");
    }
}

/**
 * Main application initialization function.
 * Fetches DOM elements, sets up Firebase, displays initial UI, and attaches event listeners.
 */
function initializeApp() {
    console.log("Initializing App v3.11..."); // Update version
    initializeDOMElements(); // Get references to all elements first

    if (demoModeIndicator) demoModeIndicator.textContent = "Live Mode - Initialiserer...";

    // Attempt Firebase connection (which will load data or fall back to demo)
    initializeFirebaseConnection();

    // Display initial UI elements that don't depend on async data
    displayDailyTip();
    updateWeeklyFeatures();

    // Setup base event listeners AFTER elements are fetched
    setupBaseEventListeners();

    // Apply saved theme or default
    const savedTheme = localStorage.getItem('fitnessAppTheme') || 'klinkekule';
    setTheme(savedTheme);

    // Set initial view (e.g., login or user list)
    setActiveView('login'); // Start on login screen

    console.log("App initialization sequence complete.");
}

// --- User Data Handling (Firebase Interaction) ---

/**
 * Loads user data from Firebase RTDB and sets up a listener for real-time updates.
 */
function loadUsersFromFirebase() {
    if (!firebaseInitialized || !usersRef) {
        console.warn("Skipping Firebase load (Firebase not initialized or usersRef is null).");
        return;
    }
    console.log("Attempting to attach Firebase listener to /users...");
    initialDataLoaded = false; // Reset flag for this load attempt

    usersRef.on('value', (snapshot) => {
        try {
            console.log("--- Firebase 'value' event triggered for /users! ---");
            const dataFromFirebase = snapshot.val();
            console.log("Snapshot value received:", dataFromFirebase);

             const defaultUserStructure = { xp: 0, level: 1, log: [], theme: 'klinkekule', lastWorkoutDate: null, streak: 0, snooped: false, lastLogin: null, achievements: [], stats: { totalWorkouts: 0, totalKm: 0, totalVolume: 0, themesTried: new Set(), timesSnooped: 0, lastMood: null, importedData: false, exportedData: false } };

            if (dataFromFirebase === null) {
                console.warn("Firebase '/users' is empty or null.");
                if (!initialDataLoaded) {
                    console.log("Database is empty. Initializing with default users...");
                    let defaultUsersForFirebase;
                     if (typeof getDefaultUsers === 'function') {
                         defaultUsersForFirebase = getDefaultUsers();
                     } else {
                         console.error("loadUsersFromFirebase: getDefaultUsers function is not defined! Cannot initialize DB.");
                         loadDefaultUsersLocally();
                         processLoadedUsers();
                         return;
                     }

                    Object.values(defaultUsersForFirebase).forEach(user => {
                        if (user.stats?.themesTried instanceof Set) {
                            user.stats.themesTried = Array.from(user.stats.themesTried);
                        } else if (!Array.isArray(user.stats?.themesTried)) {
                             user.stats = { ...(user.stats || {}), themesTried: [] };
                        }
                         if (!Array.isArray(user.log)) user.log = [];
                         if (!Array.isArray(user.achievements)) user.achievements = [];
                         // Calculate initial level based on XP using NEW logic
                         if (typeof getLevelFromTotalXP === 'function') { // Use new function name
                            user.level = getLevelFromTotalXP(user.xp || 0);
                         } else {
                            console.warn("loadUsersFromFirebase: getLevelFromTotalXP not found during default user init. Setting level to 0.");
                            user.level = 0; // Default level is 0 now
                         }
                    });

                    usersRef.set(defaultUsersForFirebase)
                        .then(() => {
                            console.log("Default users successfully set in Firebase.");
                            initialDataLoaded = true;
                        })
                        .catch(error => {
                            console.error("Failed to set default users in Firebase:", error);
                            alert("Klarte ikke initialisere database. Bruker lokale standarddata.");
                            loadDefaultUsersLocally();
                            processLoadedUsers();
                        });
                    return;
                } else {
                     console.log("Data became null after initial load. Resetting local users to defaults.");
                     loadDefaultUsersLocally();
                     processLoadedUsers();
                }
            } else {
                console.log("Processing data received from Firebase...");
                users = dataFromFirebase;

                Object.keys(users).forEach(username => {
                    const defaultClone = JSON.parse(JSON.stringify(defaultUserStructure));
                    users[username] = { ...defaultClone, ...users[username] };
                    users[username].stats = { ...defaultClone.stats, ...(users[username].stats || {}) };

                    if (Array.isArray(users[username].stats.themesTried)) {
                        users[username].stats.themesTried = new Set(users[username].stats.themesTried);
                    } else {
                        users[username].stats.themesTried = new Set();
                    }
                    if (!Array.isArray(users[username].log)) users[username].log = [];
                    if (!Array.isArray(users[username].achievements)) users[username].achievements = [];

                    // Ensure level is correctly calculated based on XP using NEW logic
                    if (typeof getLevelFromTotalXP === 'function') { // Use new function name
                        users[username].level = getLevelFromTotalXP(users[username].xp || 0);
                    } else {
                        console.warn(`loadUsersFromFirebase: getLevelFromTotalXP not found for user ${username}. Level might be incorrect.`);
                        users[username].level = users[username].level || 0; // Fallback based on new logic (0 XP = level 0)
                    }
                });

                initialDataLoaded = true;
                console.log("Calling processLoadedUsers from Firebase listener...");
                processLoadedUsers(); // Update UI with the fresh data
            }
        } catch (error) {
            console.error("Error inside Firebase 'value' callback for /users:", error);
            if (!initialDataLoaded) {
                 loadDefaultUsersLocally();
                 processLoadedUsers();
            }
        }
    }, (error) => {
        console.error("Firebase read failed (listener error for /users):", error);
        alert("Kunne ikke lese data fra Firebase. Viser lokale standarddata.");
        isDemoMode = true;
        loadDefaultUsersLocally();
        processLoadedUsers();
    });
    console.log("Firebase listener attached to /users.");
}

/**
 * Loads default user data locally. Used as a fallback or for demo mode.
 */
function loadDefaultUsersLocally() {
    console.log("Loading default users locally (Demo Mode or Fallback).");
     if (typeof getDefaultUsers === 'function') {
        users = getDefaultUsers();
         Object.keys(users).forEach(username => {
             // Calculate initial levels using NEW logic
             if (typeof getLevelFromTotalXP === 'function') { // Use new function name
                users[username].level = getLevelFromTotalXP(users[username].xp || 0);
             } else {
                 console.warn("loadDefaultUsersLocally: getLevelFromTotalXP not found. Setting level to 0.");
                 users[username].level = 0;
             }
        });
     } else {
         console.error("loadDefaultUsersLocally: getDefaultUsers function is not defined! Cannot load defaults.");
         users = {};
     }
    initialDataLoaded = true;
    isDemoMode = true;
    if(demoModeIndicator) demoModeIndicator.textContent = "Demo Mode - Ingen Firebase";
}

/**
 * Helper function to generate the default user structure.
 */
 function getDefaultUsers() {
     const defaultUserStructure = { xp: 0, level: 0, log: [], theme: 'klinkekule', lastWorkoutDate: null, streak: 0, snooped: false, lastLogin: null, achievements: [], stats: { totalWorkouts: 0, totalKm: 0, totalVolume: 0, themesTried: new Set(), timesSnooped: 0, lastMood: null, importedData: false, exportedData: false } };
     const createUser = (theme) => {
         const user = JSON.parse(JSON.stringify(defaultUserStructure));
         user.theme = theme;
         user.stats.themesTried = new Set([theme]);
         // Level is already 0 in default structure
         return user;
     };
     return {
         "Helgrim": createUser('helgrim'), "krrroppekatt": createUser('krrroppekatt'), "Kennyball": createUser('kennyball'),
         "Beerbjorn": createUser('beerbjorn'), "Dardna": createUser('dardna'), "Nikko": createUser('nikko'),
         "Skytebasen": createUser('skytebasen'), "Klinkekule": createUser('klinkekule')
     };
 }


/**
 * Processes the loaded user data and updates the UI.
 * ** Calls graph rendering if relevant view is active. **
 */
function processLoadedUsers() {
    console.log("processLoadedUsers called. User count:", Object.keys(users).length);
    initializeAppUI(); // Populates selects, renders lists etc.

    const lastUser = localStorage.getItem('fitnessAppLastUser');
    if (lastUser && users && users[lastUser] && userSelect) {
        console.log(`processLoadedUsers: Restoring last user selection from localStorage: ${lastUser}`);
        userSelect.value = lastUser;
    } else {
         console.log(`processLoadedUsers: No valid last user found in localStorage or users object.`);
    }

    if (currentUser && users[currentUser]) {
        console.log(`processLoadedUsers: Refreshing UI for already logged in user: ${currentUser}`);
        processLoginLogoutUIUpdate(); // This calls updateUI, renderLog etc.
    } else if (currentUser && !users[currentUser]) {
        // User was logged in, but doesn't exist in new data (e.g., deleted by admin)
        console.warn(`processLoadedUsers: Logged in user ${currentUser} not found in loaded data. Logging out.`);
        logoutUser();
    } else {
         // No user logged in, ensure UI reflects this
         console.log(`processLoadedUsers: No user currently logged in. Ensuring logged-out UI state.`);
         processLoginLogoutUIUpdate();
    }
     console.log(`processLoadedUsers finished. Current user is: ${currentUser}`);
}

/**
 * Sets up UI elements that depend on user data being loaded/updated.
 */
function initializeAppUI() {
    console.log("Initializing/Refreshing App UI elements dependent on user data...");
    if (!initialDataLoaded && !isDemoMode) {
        console.warn("initializeAppUI called before initial data load (Live Mode). UI might be incomplete.");
    }

    if (userSelect) populateUserSelect(); else console.error("initializeAppUI: userSelect not found");
    if (typeof populateAdminUserSelect === 'function') {
        if (adminUserSelect) populateAdminUserSelect(); else console.warn("initializeAppUI: adminUserSelect not found (OK if not admin).");
    } else { console.warn("initializeAppUI: populateAdminUserSelect function not found."); }

    if (userListDisplay) renderUserList(); else console.error("initializeAppUI: userListDisplay not found");
    if (scoreboardList) renderScoreboard(); else console.error("initializeAppUI: scoreboardList not found");

    if (currentUser && users[currentUser]) {
        console.log(`initializeAppUI: Rendering user-specific elements for ${currentUser}`);
        if (logEntriesContainer) renderLog(); else console.error("initializeAppUI: logEntriesContainer not found");
        if (typeof renderAchievements === 'function') {
            if (achievementsListContainer) renderAchievements(); else console.error("initializeAppUI: achievementsListContainer not found");
        } else { console.warn("initializeAppUI: renderAchievements function not found."); }
        // *** Render graphs if the relevant view is already active ***
        if (currentActiveView === 'profile' && typeof renderXpPerDayChart === 'function') {
            renderXpPerDayChart();
        }
        if (currentActiveView === 'scoreboard' && typeof renderTotalXpPerDayChart === 'function') {
            renderTotalXpPerDayChart();
        }
    } else {
         console.log(`initializeAppUI: No user logged in, clearing user-specific areas.`);
         if (logEntriesContainer) logEntriesContainer.innerHTML = '<p class="italic">Logg inn for å se loggen.</p>';
         if (achievementsListContainer) achievementsListContainer.innerHTML = '<p class="italic">Logg inn for å se achievements.</p>';
         // Clear graphs if logged out? Or let the render functions handle it.
    }

    updateWeeklyFeatures();

    if (typeof setTheme === 'function') {
        const themeToApply = (currentUser && users[currentUser]?.theme) ? users[currentUser].theme : (localStorage.getItem('fitnessAppTheme') || 'klinkekule');
        setTheme(themeToApply);
    } else { console.warn("initializeAppUI: setTheme function not found."); }

    console.log("App UI initialization/refresh complete.");
}

/**
 * Populates the main user selection dropdown.
 */
function populateUserSelect() {
    if (!userSelect) { console.error("populateUserSelect: userSelect element not found!"); return; }
    console.log("Populating user select. Users available:", Object.keys(users).length);

    if (typeof users !== 'object' || users === null || Object.keys(users).length === 0) {
        console.warn("populateUserSelect: users object is empty or invalid. Setting placeholder.", users);
        userSelect.innerHTML = '<option value="" disabled selected>Laster... (Ingen data)</option>';
        return;
    }

    const userKeys = Object.keys(users).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const currentSelection = userSelect.value;

    userSelect.innerHTML = '<option value="" disabled selected>-- Velg bruker --</option>';

    let foundSelection = false;
    userKeys.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        userSelect.appendChild(option);
        if (username === currentSelection) {
            foundSelection = true;
        }
    });

    if (foundSelection && userKeys.includes(currentSelection)) {
        userSelect.value = currentSelection;
    } else {
        userSelect.value = "";
    }
    console.log("User select populated. Final selected value:", userSelect.value);
}


// --- Login / Logout ---

/**
 * Logs in the specified user, updates UI and Firebase.
 * @param {string} username - The username to log in.
 */
function loginUser(username) {
    console.log(`Attempting login for: ${username}`);
    if (!users || !users[username]) {
        console.error(`Login failed: User ${username} not found in local data.`);
        if(statusDisplay) statusDisplay.textContent = "Bruker ikke funnet. Data er kanskje ikke lastet?";
        alert("Bruker ikke funnet. Prøv igjen om litt, eller sjekk om brukeren er lagt til.");
        return;
    }

    console.log(`loginUser: Setting currentUser to: ${username}`);
    currentUser = username;
    const nowISO = new Date().toISOString();

    if (firebaseInitialized && usersRef) {
        usersRef.child(currentUser).update({ lastLogin: nowISO })
            .then(() => console.log(`Updated lastLogin for ${currentUser} in RTDB.`))
            .catch(error => console.error(`Failed to update lastLogin for ${currentUser}:`, error));
    } else {
        console.warn("Firebase not ready: Did not update lastLogin in RTDB.");
        if (users[currentUser]) users[currentUser].lastLogin = nowISO;
    }

    localStorage.setItem('fitnessAppLastUser', currentUser);

    if (passwordInput) passwordInput.value = '';
    if (statusDisplay) statusDisplay.innerHTML = '';

    if (typeof setTheme === 'function') {
        setTheme(users[currentUser].theme || 'klinkekule');
    } else { console.warn("loginUser: setTheme function not found."); }

    console.log(`loginUser: Calling processLoginLogoutUIUpdate for user ${currentUser}`);
    processLoginLogoutUIUpdate();

    if (typeof setActiveView === 'function') {
        setActiveView('profile'); // Go to profile after login
    } else { console.warn("loginUser: setActiveView function not found."); }

    if (typeof updateMascot === 'function') {
        updateMascot(`Velkommen tilbake, ${currentUser}! Klar for å knuse det?`);
    } else { console.warn("loginUser: updateMascot function not found."); }

    if (typeof checkAndShowSnoopNotification === 'function') {
        checkAndShowSnoopNotification();
    } else { console.warn("loginUser: checkAndShowSnoopNotification function not found."); }

    console.log(`Successfully logged in as ${currentUser}`);
}

/**
 * Logs out the current user and updates the UI.
 */
function logoutUser() {
    if (typeof playButtonClickSound === 'function') {
        playButtonClickSound();
    } else { console.warn("logoutUser: playButtonClickSound function not found."); }

    const loggedOutUser = currentUser;
    console.log(`logoutUser: Logging out user: ${loggedOutUser}`);
    currentUser = null;
    localStorage.removeItem('fitnessAppLastUser');

    console.log(`logoutUser: Calling processLoginLogoutUIUpdate after setting currentUser to null`);
    processLoginLogoutUIUpdate(); // Update UI for logged-out state

    if (typeof updateMascot === 'function') {
        updateMascot(loggedOutUser ? `Logget ut, ${loggedOutUser}. Ha det bra!` : 'Logget ut.');
    } else { console.warn("logoutUser: updateMascot function not found."); }

    if (notificationArea) notificationArea.classList.remove('show');

    if (typeof setActiveView === 'function') {
        setActiveView('login'); // Go back to login screen
    } else { console.warn("logoutUser: setActiveView function not found."); }

    if (userSelect) userSelect.value = "";
    if (statusDisplay) statusDisplay.innerHTML = "";
    console.log(`User ${loggedOutUser} logged out.`);
}

/**
 * Centralized function to handle ALL UI updates after login, logout, or data refresh.
 * ** Calls graph rendering if relevant view is active. **
 */
function processLoginLogoutUIUpdate() {
    console.log(`--- processLoginLogoutUIUpdate START --- Current user: ${currentUser}`);
    updateLoginStateUI();

    if (currentUser && users[currentUser]) {
        console.log(`processLoginLogoutUIUpdate: User ${currentUser} is logged in. Updating specific UI.`);
        updateUI(); // Updates profile card using NEW XP logic
        renderLog(); // Renders log with potential delete buttons
        if (typeof renderAchievements === 'function') {
            renderAchievements();
        } else { console.warn("processLoginLogoutUIUpdate: renderAchievements function not found."); }
        renderUserList(); // Updates user list using NEW XP logic
        renderScoreboard(); // Updates scoreboard using NEW XP logic
        toggleNikkoButton(currentUser === "Nikko");

        // *** Render graphs if the relevant view is currently active ***
        // (This ensures graph updates if data changes while view is open)
        if (currentActiveView === 'profile' && typeof renderXpPerDayChart === 'function') {
            console.log("processLoginLogoutUIUpdate: Re-rendering profile chart due to data update.");
            renderXpPerDayChart();
        }
        if (currentActiveView === 'scoreboard' && typeof renderTotalXpPerDayChart === 'function') {
             console.log("processLoginLogoutUIUpdate: Re-rendering scoreboard chart due to data update.");
            renderTotalXpPerDayChart();
        }

    } else {
        console.log(`processLoginLogoutUIUpdate: No user logged in. Clearing specific UI.`);
        clearUserProfileUI(); // Calls chart rendering to clear them
        if (logEntriesContainer) logEntriesContainer.innerHTML = '<p class="italic">Logg inn for å se loggen.</p>';
        if (achievementsListContainer) achievementsListContainer.innerHTML = '<p class="italic">Logg inn for å se achievements.</p>';
        renderUserList(); // Still render lists even when logged out
        renderScoreboard(); // Still render lists even when logged out
        toggleNikkoButton(false);
    }

    const isAdminCheck = currentUser === "Helgrim";
    console.log(`processLoginLogoutUIUpdate: Checking admin status. currentUser: ${currentUser}, isAdminCheck: ${isAdminCheck}`);
    if (typeof toggleAdminElements === 'function') {
         toggleAdminElements(isAdminCheck);
    } else {
         console.warn("processLoginLogoutUIUpdate: toggleAdminElements function not found (Script 1 might not be loaded yet).");
    }
    console.log(`--- processLoginLogoutUIUpdate END ---`);
}

/**
 * Updates general UI elements based ONLY on login state (logged-in/logged-out classes).
 */
function updateLoginStateUI() {
    if (!appContent || !loggedInUserDisplay || !logoutButton || !loginForm) {
        console.error("updateLoginStateUI: Crucial login UI elements not found!");
        return;
    }
    console.log(`Updating general login state UI. Current user: ${currentUser}`);
    if (currentUser) {
        appContent.classList.remove('logged-out');
        appContent.classList.add('logged-in');
        loggedInUserDisplay.textContent = `Innlogget: ${currentUser}`;
    } else {
        appContent.classList.remove('logged-in');
        appContent.classList.add('logged-out');
        loggedInUserDisplay.textContent = '';
    }
}

/**
 * Updates the user's profile card display (level, XP, streak).
 * ** Uses the NEW XP calculation functions. **
 */
function updateUI() {
    if (!currentUser || !users[currentUser]) {
        console.log("updateUI: No current user or user data found.");
        clearUserProfileUI();
        return;
    }
    // Ensure necessary NEW functions/data are available
    if (typeof getLevelFromTotalXP !== 'function' || typeof getTotalXPForLevel !== 'function' || typeof getXPForLevelGain !== 'function' || typeof levelNames === 'undefined' || typeof levelEmojis === 'undefined') {
        console.error("updateUI: Missing required NEW XP functions or data (getLevelFromTotalXP, getTotalXPForLevel, getXPForLevelGain, levelNames, levelEmojis).");
        return;
    }

    const user = users[currentUser];
    const totalXP = user.xp || 0;
    // Calculate level using the NEW function
    const currentLevel = getLevelFromTotalXP(totalXP);
    user.level = currentLevel; // Update the user object's level property

    // Calculate XP needed to reach the START of the current level
    const xpForCurrentLevelStart = getTotalXPForLevel(currentLevel);
    // Calculate XP needed to complete the NEXT level up (level currentLevel + 1)
    const xpNeededForThisLevelBracket = getXPForLevelGain(currentLevel + 1);
    // Calculate XP earned *within* the current level bracket
    const xpInCurrentLevel = totalXP - xpForCurrentLevelStart;

    // Calculate progress percentage for the progress bar
    const progress = xpNeededForThisLevelBracket > 0 ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForThisLevelBracket) * 100)) : 0;

    // Update Profile Card elements
    if (levelDisplay) levelDisplay.textContent = `${levelNames[currentLevel] || "Ukjent Nivånavn"} (Nivå ${currentLevel})`;
    if (levelEmojiDisplay) {
        const keys = Object.keys(levelEmojis).map(Number).sort((a, b) => b - a);
        const emojiKey = keys.find(key => currentLevel >= key);
        levelEmojiDisplay.textContent = emojiKey !== undefined ? levelEmojis[emojiKey] : '';
    }
    if (xpCurrentDisplay) xpCurrentDisplay.textContent = xpInCurrentLevel.toLocaleString('no-NO');
    if (xpNextLevelDisplay) xpNextLevelDisplay.textContent = xpNeededForThisLevelBracket.toLocaleString('no-NO'); // Show XP needed for this bracket
    if (xpTotalDisplay) xpTotalDisplay.textContent = totalXP.toLocaleString('no-NO');
    if (xpProgressBar) xpProgressBar.style.width = `${progress}%`;
    if (streakCounter) streakCounter.textContent = user.streak || 0;

    // Update the separate status display (if still used)
    if (statusDisplay) {
        statusDisplay.innerHTML = `<h2>${currentUser}</h2><p>XP: ${totalXP.toLocaleString('no-NO')}</p><p>Nivå: ${levelNames[currentLevel] || "Ukjent"} (Level ${currentLevel})</p>`;
    }
     console.log(`UI updated for ${currentUser}: Level ${currentLevel}, XP ${totalXP}, XP in level: ${xpInCurrentLevel}/${xpNeededForThisLevelBracket}, Progress ${progress.toFixed(1)}%`);
}

/**
 * Clears the user profile UI elements when logged out or data is unavailable.
 * ** Also calls graph functions to clear charts. **
 */
function clearUserProfileUI() {
     if (levelDisplay) levelDisplay.textContent = 'Logg inn';
     if (levelEmojiDisplay) levelEmojiDisplay.textContent = '';
     if (xpCurrentDisplay) xpCurrentDisplay.textContent = '0';
     // Update placeholder for XP needed for level 1 using NEW function
     if (xpNextLevelDisplay) {
         if(typeof getXPForLevelGain === 'function') {
             xpNextLevelDisplay.textContent = getXPForLevelGain(1).toLocaleString('no-NO'); // XP for level 1 gain
         } else {
             xpNextLevelDisplay.textContent = '10'; // Fallback
         }
     }
     if (xpTotalDisplay) xpTotalDisplay.textContent = '0';
     if (xpProgressBar) xpProgressBar.style.width = '0%';
     if (streakCounter) streakCounter.textContent = '0';
     if (statusDisplay) statusDisplay.innerHTML = '';
     // Clear the profile chart if logged out
     if (typeof renderXpPerDayChart === 'function') {
          console.log("Clearing profile chart (logged out).");
          renderXpPerDayChart(); // Will detect no user and clear/destroy
     }
      // Clear the scoreboard chart if logged out
     if (typeof renderTotalXpPerDayChart === 'function') {
          console.log("Clearing scoreboard chart (logged out).");
          renderTotalXpPerDayChart(); // Will detect no users and clear/destroy
     }
}

// --- Workout Logging --- (Includes Anti-Cheat)

/**
 * Renders the list of activities added during the current workout session.
 */
function renderCurrentSession() {
     if (!currentSessionList) return;
    if (currentWorkout.length === 0) {
        currentSessionList.innerHTML = '<li class="italic">Ingen aktivitet lagt til enda...</li>';
        if (completeWorkoutButton) completeWorkoutButton.disabled = true;
        return;
    }
    currentSessionList.innerHTML = currentWorkout.map(item => {
        let details = '';
        if (item.type === 'Gåtur') { details = `${item.km} km`; }
        else { details = `${item.kilos}kg x ${item.reps} reps x ${item.sets} sett`; }
        const moodEmojis = { great: '😃', good: '😊', ok: '😐', meh: '😕', bad: '😩' };
        const moodEmoji = moodEmojis[item.mood] || '';
        return `<li class="text-sm">${item.name} (${details}) ${moodEmoji} - ${item.xp} XP ${item.comment ? `<i class="opacity-70">(${item.comment})</i>` : ''}</li>`;
    }).join('');
    if (completeWorkoutButton) completeWorkoutButton.disabled = false;
}

/**
 * Handles the completion of a workout session.
 * ** Adds entryId and uses the NEW getLevelFromTotalXP function. **
 */
function completeWorkout() {
    if (currentWorkout.length === 0 || !currentUser || !users[currentUser]) {
        console.warn("Complete workout called but prerequisites not met (empty session or no user).");
        return;
    }
    if (!firebaseInitialized || !usersRef) {
        alert("Kan ikke lagre økt, ingen Firebase-tilkobling. Prøv å eksportere data manuelt?");
        return;
    }
    // Ensure necessary functions are available
    if (typeof playButtonClickSound !== 'function' || typeof getLevelFromTotalXP !== 'function' || typeof checkAchievements !== 'function' || typeof playXPSound !== 'function' || typeof triggerLevelUpAnimation !== 'function' || typeof playLevelUpSound !== 'function' || typeof updateMascot !== 'function' || typeof setActiveView !== 'function') {
         console.error("completeWorkout: Missing required functions!");
         alert("En intern feil oppstod (manglende funksjoner). Kan ikke fullføre økt.");
         return;
    }

    playButtonClickSound();
    console.log(`Completing workout for ${currentUser}. Activities: ${currentWorkout.length}`);
    const userData = users[currentUser];
    const userDataRef = usersRef.child(currentUser);
    const sessionXP = currentWorkout.reduce((sum, ex) => sum + (ex.xp || 0), 0);
    const sessionVol = currentWorkout.reduce((sum, ex) => sum + (ex.type !== 'Gåtur' ? ((ex.kilos || 0) * (ex.reps || 0) * (ex.sets || 0)) : 0), 0);
    const sessionKm = currentWorkout.reduce((sum, ex) => sum + (ex.type === 'Gåtur' ? (ex.km || 0) : 0), 0);
    const sessionMood = currentWorkout.length > 0 ? currentWorkout[currentWorkout.length - 1].mood : 'good';
    const today = new Date().toISOString().split('T')[0];
    let streak = userData.streak || 0;
    let lastDate = userData.lastWorkoutDate;
    let streakBonusMultiplier = 1.0;
    let streakBonusText = null;
    if (lastDate && lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDate === yesterday) { streak++; } else { streak = 1; }
    } else if (!lastDate) { streak = 1; }
    if (streak > 1) {
        streakBonusMultiplier = Math.min(1 + (streak - 1) * 0.1, 1.5);
        streakBonusText = `${((streakBonusMultiplier - 1) * 100).toFixed(0)}% streak bonus!`;
    }
    const finalSessionXP = Math.round(sessionXP * streakBonusMultiplier);

    // *** ADD unique entryId ***
    const entryId = Date.now(); // Use timestamp as a simple unique ID

    const entry = {
        entryId: entryId, // Add the ID here
        date: new Date().toLocaleString('no-NO', { dateStyle: 'short', timeStyle: 'short' }),
        isoDate: today,
        exercises: [...currentWorkout],
        totalXP: finalSessionXP,
        baseXP: sessionXP,
        totalVolume: sessionVol,
        totalKm: sessionKm,
        mood: sessionMood,
        streakBonus: streakBonusText,
        streakDays: streak
    };

    if (!Array.isArray(userData.log)) userData.log = [];
    userData.log.unshift(entry); // Add entry with ID
    const previousLevel = userData.level;
    const currentTotalXP = userData.xp || 0;
    const newTotalXP = currentTotalXP + finalSessionXP;
    userData.xp = newTotalXP;
    userData.lastWorkoutDate = today;
    userData.streak = streak;
    if (!userData.stats) userData.stats = { totalWorkouts: 0, totalKm: 0, totalVolume: 0, themesTried: new Set(), timesSnooped: 0, lastMood: null };
    userData.stats.totalWorkouts = (userData.stats.totalWorkouts || 0) + 1;
    userData.stats.totalKm = (userData.stats.totalKm || 0) + sessionKm;
    userData.stats.totalVolume = (userData.stats.totalVolume || 0) + sessionVol;
    userData.stats.lastMood = sessionMood;

    // *** Use NEW function to calculate level ***
    userData.level = getLevelFromTotalXP(newTotalXP);

    checkAchievements(currentUser); // Check achievements AFTER stats/level are updated
    const userDataToSave = JSON.parse(JSON.stringify(userData));
    if (userDataToSave.stats?.themesTried instanceof Set) { userDataToSave.stats.themesTried = Array.from(userDataToSave.stats.themesTried); }
    else if (!Array.isArray(userDataToSave.stats?.themesTried)) { userDataToSave.stats.themesTried = []; }
    if (!Array.isArray(userDataToSave.log)) userDataToSave.log = [];
    if (!Array.isArray(userDataToSave.achievements)) userDataToSave.achievements = [];
    userDataRef.set(userDataToSave)
        .then(() => {
            console.log(`User data for ${currentUser} saved to RTDB after workout.`);
            playXPSound();
            if (userData.level > previousLevel) {
                triggerLevelUpAnimation(userData.level);
                playLevelUpSound();
                updateMascot(`LEVEL UP, ${currentUser}! Du nådde nivå ${userData.level}! 🎉`);
            } else {
                updateMascot(`Økt fullført! +${finalSessionXP.toLocaleString('no-NO')} XP! ${streak > 1 ? `Streak: ${streak} dager!` : ''} Bra jobba! 💪`);
            }
            currentWorkout = [];
            renderCurrentSession();
            updateUI(); // Update UI with new XP/Level
            renderLog();
            setActiveView('profile'); // Go back to profile after workout
        })
        .catch(error => {
            console.error(`Failed to save user data for ${currentUser}:`, error);
            alert("Feil ved lagring av økt til Firebase! Data er kanskje ikke lagret.");
        });
}


// --- Log Rendering ---

/**
 * Renders the user's workout log entries.
 * ** Adds Delete button for entries within 48 hours. **
 */
function renderLog() {
    if (!logEntriesContainer) { console.error("renderLog: Log container not found."); return; }
    if (!currentUser || !users[currentUser] || !Array.isArray(users[currentUser].log) || users[currentUser].log.length === 0) {
        logEntriesContainer.innerHTML = '<p class="italic">Ingen loggførte økter enda. Gå til "Logg Økt" for å starte!</p>';
        return;
    }
    // Ensure isEditable function from Script 4 is available
    const isEditableAvailable = typeof isEditable === 'function';
    if (!isEditableAvailable) {
        console.warn("renderLog: isEditable function (from Script 4) not found! Delete buttons will not be shown.");
    }

    const log = users[currentUser].log; // Get the log array
    console.log(`Rendering log for ${currentUser}. Entries: ${log.length}`);

    // Sort log entries by date descending (newest first) - assuming isoDate exists
    const sortedLog = [...log].sort((a, b) => (b.isoDate || '0').localeCompare(a.isoDate || '0'));


    logEntriesContainer.innerHTML = sortedLog.map(entry => {
        // Format exercises within the entry
        const exercisesHtml = entry.exercises.map(ex => {
            let details = '';
            if (ex.type === 'Gåtur') { details = `${ex.km} km`; }
            else { details = `${ex.kilos || 0}kg x ${ex.reps || 0}r x ${ex.sets || 0}s`; }
             const moodEmojis = { great: '😃', good: '😊', ok: '😐', meh: '😕', bad: '😩' };
             const moodEmoji = moodEmojis[ex.mood] || '';
            return `<li class="ml-4 text-sm">${ex.name} (${details}) ${moodEmoji} - ${ex.xp} XP ${ex.comment ? `<i class="opacity-70">(${ex.comment})</i>` : ''}</li>`;
        }).join('');

        // Format entry date/time
        const entryDate = entry.date || (entry.isoDate ? new Date(entry.isoDate).toLocaleDateString('no-NO') : 'Ukjent dato');

        // Add streak info if available
        const streakInfo = entry.streakDays ? `(Dag ${entry.streakDays} streak)` : '';
        const bonusInfo = entry.streakBonus ? `<span class="text-xs text-yellow-400 ml-1">${entry.streakBonus}</span>` : '';

        // *** Check if editable and add Delete button ***
        const editable = isEditableAvailable && isEditable(entry);
        const deleteButtonHtml = editable && entry.entryId ? // Check if entryId exists
            `<button
                class="button-base button-secondary text-xs py-0 px-1 ml-2 delete-log-button border-red-500 text-red-300 hover:bg-red-700 hover:text-white"
                data-entry-id="${entry.entryId}"
                title="Slett denne loggføringen (innen 48t)">
                Slett
             </button>`
             : ''; // No button if not editable or no ID

        return `
            <div class="border-b border-card pb-3 mb-3">
                <div class="flex justify-between items-start"> <p class="font-semibold">
                        ${entryDate} - Total XP: ${entry.totalXP.toLocaleString('no-NO')}
                        ${streakInfo} ${bonusInfo}
                         ${entry.mood ? `<span class="ml-2 text-xs italic opacity-80">(Økt føltes: ${entry.mood})</span>` : ''}
                    </p>
                    ${deleteButtonHtml} </div>
                <ul class="list-disc list-inside mt-1 space-y-1">
                    ${exercisesHtml}
                </ul>
            </div>
        `;
    }).join('');
}

// --- NEW: Log Deletion Handler ---
/**
 * Handles the click event for deleting a log entry.
 * Confirms with user, calls helper function, saves to Firebase.
 * @param {number|string} entryId - The unique ID of the entry to delete.
 */
function handleDeleteLogEntryClick(entryId) {
    // Convert ID to number just in case it comes from dataset as string
    const entryIdNum = Number(entryId);
    if (isNaN(entryIdNum)) { console.error("handleDeleteLogEntryClick: Invalid entryId provided:", entryId); return; }
    if (!currentUser || !users[currentUser] || !Array.isArray(users[currentUser].log)) { console.error("handleDeleteLogEntryClick: No user or log found."); return; }
    if (typeof deleteLogEntry !== 'function') { console.error("handleDeleteLogEntryClick: deleteLogEntry function (from Script 4) not found."); alert("Slettefunksjon mangler."); return; }
    if (!firebaseInitialized || !usersRef) { alert("Kan ikke slette, Firebase ikke tilkoblet."); return; }

    // Find entry details for confirmation message (optional but nice)
    const entryToDelete = users[currentUser].log.find(entry => entry.entryId === entryIdNum);
    const confirmMessage = entryToDelete ? `Er du sikker på at du vil slette loggføringen fra ${entryToDelete.date || 'denne datoen'}?\nDette kan ikke angres.` : "Er du sikker på at du vil slette denne loggføringen?\nDette kan ikke angres.";

    if (confirm(confirmMessage)) {
        console.log(`Attempting to delete log entry with ID: ${entryIdNum}`);
        const currentLog = users[currentUser].log;
        const updatedLog = deleteLogEntry(entryIdNum, currentLog); // Call helper from Script 4

        if (updatedLog !== null) {
            // Update local user object
            users[currentUser].log = updatedLog;

            // --- Recalculation (Skipped for now) ---
            console.warn("Log entry deleted, but user total XP/stats were NOT recalculated. Stats might be inaccurate.");
            // TODO: Implement recalculation of XP, level, stats if needed in future.

            // Prepare full user data for saving (convert sets etc.)
            const userDataToSave = JSON.parse(JSON.stringify(users[currentUser]));
            if (userDataToSave.stats?.themesTried instanceof Set) {
                userDataToSave.stats.themesTried = Array.from(userDataToSave.stats.themesTried);
            } else if (!Array.isArray(userDataToSave.stats?.themesTried)) {
                userDataToSave.stats.themesTried = [];
            }
            if (!Array.isArray(userDataToSave.log)) userDataToSave.log = []; // Should exist, but safe check
            if (!Array.isArray(userDataToSave.achievements)) userDataToSave.achievements = [];

            // Save updated user data to Firebase
            usersRef.child(currentUser).set(userDataToSave)
                .then(() => {
                    console.log(`Log entry ${entryIdNum} deleted successfully for ${currentUser}.`);
                    showNotification("Loggføring slettet!");
                    renderLog(); // Re-render the log view
                    // Optionally update other UI elements if stats were recalculated
                    // updateUI();
                })
                .catch(error => {
                    console.error(`Failed to save user data after deleting log entry ${entryIdNum}:`, error);
                    alert("Kunne ikke lagre endringer etter sletting.");
                    // Revert local log change on save error
                    users[currentUser].log = currentLog;
                    renderLog(); // Re-render to show the entry again
                });
        } else {
            console.error(`Failed to delete log entry ${entryIdNum} locally (not found?).`);
            alert("Kunne ikke slette loggføringen (intern feil).");
        }
    } else {
        console.log("Log entry deletion cancelled by user.");
    }
}


// --- User List & Snoop ---

/**
 * Renders the list of all users, sorted by XP, with a snoop button if applicable.
 * ** Uses the NEW getLevelFromTotalXP function. **
 */
function renderUserList() {
     if (!userListDisplay) { console.error("renderUserList: User list display element not found."); return; }
    console.log("Rendering user list...");
    if (!users || Object.keys(users).length === 0) {
        userListDisplay.innerHTML = '<li class="italic">Laster brukerliste...</li>';
        return;
    }
    if (typeof levelNames === 'undefined' || typeof getLevelFromTotalXP !== 'function') {
        console.error("renderUserList: Missing levelNames or getLevelFromTotalXP.");
        userListDisplay.innerHTML = '<li class="italic">Feil ved lasting av brukerliste (manglende data).</li>';
        return;
    }
    const sortedUsernames = Object.keys(users).sort((a, b) => (users[b].xp || 0) - (users[a].xp || 0));
    userListDisplay.innerHTML = sortedUsernames.map(username => {
        const user = users[username];
        const level = getLevelFromTotalXP(user.xp || 0); // Use new function
        const levelName = levelNames[level] || "Ukjent";
        const canSnoop = currentUser && currentUser !== username;
        return `
            <li class="flex justify-between items-center py-2 border-b border-card hover:bg-white hover:bg-opacity-5 transition-colors duration-150">
                <span class="flex-grow">
                    <span class="font-semibold text-accent">${username}</span>
                    <span class="text-sm"> - Nivå ${level} (${levelName}) - ${user.xp || 0} XP</span>
                </span>
                ${canSnoop ? `<button class="button-base button-secondary text-xs py-1 px-2 snoop-button ml-2 flex-shrink-0" data-username="${username}">Snok</button>` : ''}
            </li>
        `;
    }).join('');
}

/**
 * Shows the snoop modal with details about the target user.
 * ** Uses the NEW getLevelFromTotalXP function. **
 */
function showSnoopedLog(targetUsername) {
     if (!snoopModal || !snoopModalTitle || !snoopModalLog || !users || !users[targetUsername]) { console.error("showSnoopedLog: Missing elements or target user data."); return; }
     if (typeof getLevelFromTotalXP !== 'function' || typeof levelNames === 'undefined' || typeof achievementList === 'undefined') { console.error("showSnoopedLog: Missing required functions or data."); return; }
    const targetUser = users[targetUsername];
    const snoopUserInfo = document.getElementById('snoop-user-info');
    const snoopAchievements = document.getElementById('snoop-achievements');
    const snoop7dVolume = document.getElementById('snoop-7d-volume');
    const snoop7dKm = document.getElementById('snoop-7d-km');
    const snoop7dXp = document.getElementById('snoop-7d-xp');
    const snoopLevel = document.getElementById('snoop-level');
    const snoopXp = document.getElementById('snoop-xp');
    const snoopLastLogin = document.getElementById('snoop-last-login');
    const snoopLastMood = document.getElementById('snoop-last-mood');
    snoopModalTitle.textContent = `Snoker på: ${targetUsername}`;
    if (snoopUserInfo) {
        const level = getLevelFromTotalXP(targetUser.xp || 0); // Use new function
        if (snoopLevel) snoopLevel.textContent = `${level} (${levelNames[level] || 'Ukjent'})`;
        if (snoopXp) snoopXp.textContent = (targetUser.xp || 0).toLocaleString('no-NO');
        if (snoopLastLogin) snoopLastLogin.textContent = targetUser.lastLogin ? new Date(targetUser.lastLogin).toLocaleString('no-NO') : 'Aldri';
        if (snoopLastMood) snoopLastMood.textContent = targetUser.stats?.lastMood || 'Ingen data';
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let volume7d = 0, km7d = 0, xp7d = 0;
        if (Array.isArray(targetUser.log)) {
            targetUser.log.forEach(entry => {
                if (entry.isoDate && entry.isoDate >= sevenDaysAgo) {
                    volume7d += entry.totalVolume || 0; xp7d += entry.totalXP || 0;
                    if (Array.isArray(entry.exercises)) { entry.exercises.forEach(ex => { if (ex.type === 'Gåtur') km7d += ex.km || 0; }); }
                }
            });
        }
        if (snoop7dVolume) snoop7dVolume.textContent = volume7d.toLocaleString('no-NO');
        if (snoop7dKm) snoop7dKm.textContent = km7d.toFixed(1);
        if (snoop7dXp) snoop7dXp.textContent = xp7d.toLocaleString('no-NO');
    } else { console.warn("showSnoopedLog: snoop-user-info element not found."); }
    if (snoopAchievements) {
        const userAchievements = targetUser.achievements || [];
        if (typeof achievementList !== 'undefined' && achievementList.length > 0) {
            snoopAchievements.innerHTML = achievementList.map(ach => { const unlocked = userAchievements.includes(ach.id); return `<li class="${unlocked ? 'achievement-unlocked font-semibold' : 'achievement-locked opacity-60'}"> ${unlocked ? '✔️' : '🔒'} ${ach.name}</li>`; }).join('');
        } else { snoopAchievements.innerHTML = '<li class="italic">Ingen achievements definert.</li>'; }
    } else { console.warn("showSnoopedLog: snoop-achievements element not found."); }
    snoopModalLog.innerHTML = '<p class="italic">Laster logg...</p>';
    if (Array.isArray(targetUser.log) && targetUser.log.length > 0) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const recentLogs = targetUser.log.filter(entry => entry.isoDate && entry.isoDate >= sevenDaysAgo).sort((a, b) => (b.isoDate || '0').localeCompare(a.isoDate || '0'));
        if (recentLogs.length > 0) {
            snoopModalLog.innerHTML = recentLogs.map(entry => {
                const exercisesHtml = entry.exercises.map(ex => { let details = ''; if (ex.type === 'Gåtur') { details = `${ex.km} km`; } else { details = `${ex.kilos || 0}kg x ${ex.reps || 0}r x ${ex.sets || 0}s`; } return `<li class="ml-4">${ex.name} (${details}) - ${ex.xp}XP</li>`; }).join('');
                const entryDate = entry.date || (entry.isoDate ? new Date(entry.isoDate).toLocaleDateString('no-NO') : 'Ukjent dato');
                return `<div class="mb-2 border-b border-card pb-1"><p><strong>${entryDate}</strong> (+${entry.totalXP} XP)</p><ul class="list-disc list-inside text-xs">${exercisesHtml}</ul></div>`;
            }).join('');
        } else { snoopModalLog.innerHTML = '<p class="italic">Ingen økter logget de siste 7 dagene.</p>'; }
    } else { snoopModalLog.innerHTML = '<p class="italic">Ingen loggførte økter.</p>'; }
    if (snoopModal) snoopModal.classList.add('show');
}

/**
 * Checks if the current user has been marked as 'snooped' upon login.
 * ** Includes fix for potential crash. **
 */
function checkAndShowSnoopNotification() {
    if (!currentUser || !users[currentUser] || !firebaseInitialized || !usersRef) return;

    const userData = users[currentUser];
    // *** FIX: Add check if userData exists before accessing snooped ***
    if (userData && userData.snooped) {
        // Ensure showNotification exists before calling
        if (typeof showNotification === 'function') {
            showNotification(`${currentUser}, noen snoket på profilen din mens du var borte! 👀`);
        } else {
             console.warn("checkAndShowSnoopNotification: showNotification function not found.");
        }

        // Reset the flag in Firebase
        usersRef.child(currentUser).update({ snooped: false })
            .then(() => console.log(`Reset snooped flag for ${currentUser}.`))
            .catch(error => console.error(`Failed to reset snooped flag for ${currentUser}:`, error));
        // Also reset locally immediately for UI consistency
        userData.snooped = false;
    } else if (!userData) {
         console.warn("checkAndShowSnoopNotification: userData is missing or invalid for currentUser:", currentUser);
    }
}


// --- Scoreboard ---

/**
 * Renders the weekly XP scoreboard.
 * ** Uses the NEW getLevelFromTotalXP function. **
 */
function renderScoreboard() {
    // ... (Keep existing logic, but ensure it uses getLevelFromTotalXP) ...
     if (!scoreboardList) { console.error("renderScoreboard: Scoreboard list element not found."); return; }
    console.log("Rendering scoreboard...");
    if (!users || Object.keys(users).length === 0) { scoreboardList.innerHTML = '<li class="italic">Laster scoreboard...</li>'; return; }
     if (typeof getLevelFromTotalXP !== 'function') { console.error("renderScoreboard: Missing required function getLevelFromTotalXP."); scoreboardList.innerHTML = '<li class="italic">Feil ved lasting av scoreboard.</li>'; return; }
    const now = new Date(); const dayOfWeek = now.getDay(); const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); const startOfWeek = new Date(now.setDate(diff)); startOfWeek.setHours(0, 0, 0, 0); const startOfWeekISO = startOfWeek.toISOString().split('T')[0];
    const weeklyXP = Object.entries(users).map(([username, userData]) => {
        let xp = 0; if (Array.isArray(userData.log)) { userData.log.forEach(entry => { if (entry.isoDate && entry.isoDate >= startOfWeekISO) { xp += entry.totalXP || 0; } }); }
        const level = getLevelFromTotalXP(userData.xp || 0); // Use new function
        return { username, weeklyXP: xp, level: level };
    });
    weeklyXP.sort((a, b) => b.weeklyXP - a.weeklyXP);
    scoreboardList.innerHTML = weeklyXP.map((data, index) => { return `<li class="py-1"><span class="font-semibold">${index + 1}. ${data.username}</span> - ${data.weeklyXP.toLocaleString('no-NO')} XP denne uken (Nivå ${data.level})</li>`; }).join('');
}


// --- Achievements ---

/**
 * Checks if the user has unlocked any new achievements.
 * ** Calls new pop-up function. **
 * @param {string} username - The username to check.
 */
function checkAchievements(username) {
    if (!users[username] || typeof achievementList === 'undefined') return;
    // Ensure triggerAchievementUnlockAnimation exists
    const canTriggerPopup = typeof triggerAchievementUnlockAnimation === 'function';
    if (!canTriggerPopup) { console.warn("checkAchievements: triggerAchievementUnlockAnimation function not found."); }


    const user = users[username];
    if (!Array.isArray(user.achievements)) user.achievements = [];
    let changed = false;
    let newlyUnlocked = [];

    achievementList.forEach(ach => {
        if (!user.achievements.includes(ach.id)) {
            if (ach.criteria && typeof ach.criteria === 'function') {
                 try {
                     if (ach.criteria(user)) {
                         user.achievements.push(ach.id);
                         newlyUnlocked.push(ach);
                         changed = true;
                         console.log(`${username} unlocked achievement: ${ach.name}`);
                     }
                 } catch (error) { console.error(`Error checking criteria for achievement '${ach.id}' for user ${username}:`, error); }
            }
        }
    });

    if (changed) {
        newlyUnlocked.forEach((ach, index) => {
            setTimeout(() => {
                // *** Use new pop-up function ***
                if (canTriggerPopup) {
                    triggerAchievementUnlockAnimation(ach.name);
                } else {
                    // Fallback to old notification if pop-up function missing
                    showNotification(`Achievement Låst Opp: ${ach.name}!`);
                }
                playLevelUpSound(); // Keep sound feedback
            }, index * 1000); // Stagger slightly more
        });

        if (firebaseInitialized && usersRef) {
            usersRef.child(username).child('achievements').set(user.achievements)
                .then(() => console.log(`Updated achievements for ${username} in RTDB.`))
                .catch(error => console.error(`Failed to update achievements for ${username}:`, error));
        }
        if (username === currentUser) { renderAchievements(); }
    }
}


/**
 * Renders the list of achievements for the currently logged-in user.
 */
function renderAchievements() { /* ... (Keep existing logic) ... */ if (!achievementsListContainer) { console.error("renderAchievements: Container not found."); return; } if (!currentUser || !users[currentUser]) { achievementsListContainer.innerHTML = '<p class="italic">Logg inn for å se dine achievements.</p>'; return; } const userAchievements = users[currentUser].achievements || []; console.log("Rendering achievements for:", currentUser, userAchievements); if (typeof achievementList === 'undefined' || achievementList.length === 0) { achievementsListContainer.innerHTML = '<p class="italic">Ingen achievements definert ennå.</p>'; return; } achievementsListContainer.innerHTML = achievementList.map(ach => { const unlocked = userAchievements.includes(ach.id); return ` <div class="py-2 border-b border-card ${unlocked ? 'achievement-unlocked' : 'achievement-locked opacity-60'} transition-opacity duration-300"> <span class="text-lg mr-2">${unlocked ? '✔️' : '🔒'}</span> <span> <strong class="${unlocked ? 'text-accent font-semibold' : 'font-medium'}">${ach.name}</strong> <p class="text-sm">${ach.description}</p> </span> </div> `; }).join(''); }


// --- UI Helpers ---

/**
 * Sets the currently active view/section.
 * ** Calls graph rendering functions when relevant views are activated. **
 * @param {string} viewId - The ID of the view to activate.
 */
function setActiveView(viewId) {
    console.log("Setting active view:", viewId);
    currentActiveView = viewId; // Store the active view

    if (viewSections) {
        viewSections.forEach(section => {
            const isActive = section.id === `${viewId}-view`;
            section.classList.toggle('active', isActive);
        });
    } else { console.error("setActiveView: viewSections NodeList not found."); }

    if (viewButtons) {
        viewButtons.forEach(button => {
             const isMatchingButton = button.dataset.view === viewId;
            button.classList.toggle('nav-button-active', isMatchingButton);
            button.classList.toggle('nav-button-inactive', !isMatchingButton);
        });
    } else { console.error("setActiveView: viewButtons NodeList not found."); }

    // Initialize chat listener if chat view is activated
    if (viewId === 'chat' && !chatListenerAttached && typeof initializeChat === 'function') {
        initializeChat();
    }

    // *** Render appropriate chart when view is activated ***
    if (viewId === 'profile') {
        if (typeof renderXpPerDayChart === 'function') {
            console.log("Profile view activated, attempting to render XP chart.");
            renderXpPerDayChart(); // Call function from Script 5
        } else {
            console.warn("setActiveView: renderXpPerDayChart function (from Script 5) not found.");
            const errorElement = document.getElementById('xpChartError');
            if (errorElement) errorElement.textContent = "Graf-funksjon mangler (Script 5).";
        }
    } else if (viewId === 'scoreboard') {
         if (typeof renderTotalXpPerDayChart === 'function') {
            console.log("Scoreboard view activated, attempting to render Total XP chart.");
            renderTotalXpPerDayChart(); // Call function from Script 5
        } else {
            console.warn("setActiveView: renderTotalXpPerDayChart function (from Script 5) not found.");
            const errorElement = document.getElementById('totalXpChartError'); // Use the correct error element ID
            if (errorElement) errorElement.textContent = "Graf-funksjon mangler (Script 5).";
        }
    }
}
/**
 * Displays a temporary notification message.
 */
function showNotification(message) { /* ... (Keep existing logic) ... */ if (!notificationArea) { console.warn("showNotification: notificationArea element not found."); return; } notificationArea.textContent = message; notificationArea.classList.remove('show'); void notificationArea.offsetWidth; notificationArea.classList.add('show'); }
/**
 * Triggers the visual level-up animation.
 */
function triggerLevelUpAnimation(newLevel) { /* ... (Keep existing logic) ... */ if (!levelUpIndicator || !levelUpNewLevel) { console.warn("triggerLevelUpAnimation: Level up elements not found."); return; } if (typeof levelNames !== 'undefined') { levelUpNewLevel.textContent = `Nivå ${newLevel}: ${levelNames[newLevel] || 'Ukjent'}!`; } else { levelUpNewLevel.textContent = `Nivå ${newLevel}!`; } levelUpIndicator.classList.remove('show'); void levelUpIndicator.offsetWidth; levelUpIndicator.classList.add('show'); setTimeout(() => { if (levelUpIndicator) levelUpIndicator.classList.remove('show'); }, 3000); }

// --- NEW: Achievement Pop-up Trigger ---
/**
 * Triggers the visual achievement unlocked animation.
 * @param {string} achievementName - The name of the achievement unlocked.
 */
function triggerAchievementUnlockAnimation(achievementName) {
    // Assumes achievementIndicator and achievementIndicatorNameSpan are fetched globally
    if (!achievementIndicator || !achievementIndicatorNameSpan) {
        console.warn("triggerAchievementUnlockAnimation: Achievement indicator elements not found.");
        // Fallback to standard notification if pop-up element is missing
        showNotification(`Achievement Låst Opp: ${achievementName}!`);
        return;
    }

    console.log(`Triggering achievement pop-up for: ${achievementName}`);

    // Set the achievement name in the pop-up
    achievementIndicatorNameSpan.textContent = achievementName;

    // Show the indicator (triggers CSS transition/animation)
    achievementIndicator.classList.remove('show'); // Reset animation if already showing
    void achievementIndicator.offsetWidth; // Trigger reflow
    achievementIndicator.classList.add('show');

    // Automatically hide after a delay (e.g., 4 seconds)
    setTimeout(() => {
        if (achievementIndicator) achievementIndicator.classList.remove('show');
    }, 4000); // Adjust duration as needed (should be longer than CSS transition)
}


// --- Theme ---

/**
 * Applies the selected theme to the application body and saves preference.
 */
function setTheme(themeName) { /* ... (Keep existing logic) ... */ console.log("Setting theme:", themeName); if (!body || !themeName) { console.warn("setTheme: Body element or themeName missing."); return; } const themeClass = `theme-${themeName}`; body.className = body.className.replace(/theme-\w+/g, '').trim(); body.classList.add(themeClass); localStorage.setItem('fitnessAppTheme', themeName); if (currentUser && users[currentUser]) { const user = users[currentUser]; if (user.theme !== themeName) { user.theme = themeName; if (!user.stats) user.stats = { themesTried: new Set() }; if (!(user.stats.themesTried instanceof Set)) user.stats.themesTried = new Set(); user.stats.themesTried.add(themeName); checkAchievements(currentUser); const themesTriedArray = Array.from(user.stats.themesTried); if (firebaseInitialized && usersRef) { usersRef.child(currentUser).update({ theme: themeName, 'stats/themesTried': themesTriedArray }).then(() => console.log(`Updated theme and themesTried for ${currentUser} in RTDB.`)).catch(error => console.error(`Failed to update theme/themesTried for ${currentUser}:`, error)); } else { console.warn("Firebase not ready: Did not update theme/themesTried in RTDB."); } } } }


// --- Sound Effects --- (Requires Tone.js library loaded)

/**
 * Initializes the Tone.js synthesizer if not already done.
 */
async function initializeAudio() { /* ... (Keep existing logic) ... */ if (typeof Tone !== 'undefined' && !Tone.started) { try { await Tone.start(); console.log("AudioContext started via Tone.js!"); if (!synth) { synth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 } }).toDestination(); console.log("Tone.js Synth created."); } } catch (e) { console.error("Could not start Tone.js AudioContext:", e); retroSoundEnabled = false; if(retroModeButton) retroModeButton.textContent = `Retro Mode Lyd (Feil)`; } } else if (typeof Tone !== 'undefined' && Tone.started && !synth) { synth = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 } }).toDestination(); console.log("Tone.js Synth created (context was already started)."); } else if (typeof Tone === 'undefined') { console.warn("Tone.js library not loaded. Sound effects disabled."); retroSoundEnabled = false; } }
/** Plays a simple click sound if retro sound is enabled. */
function playButtonClickSound() { /* ... (Keep existing logic) ... */ if (!retroSoundEnabled || !synth || typeof Tone === 'undefined' || !Tone.started) return; try { synth.triggerAttackRelease("G4", "16n", Tone.now()); } catch (e) { console.warn("Tone.js synth error (click):", e); } }
/** Plays a sound indicating XP gain if retro sound is enabled. */
function playXPSound() { /* ... (Keep existing logic) ... */ if (!retroSoundEnabled || !synth || typeof Tone === 'undefined' || !Tone.started) return; try { const now = Tone.now(); synth.triggerAttackRelease("A5", "16n", now); synth.triggerAttackRelease("C6", "16n", now + 0.08); } catch (e) { console.warn("Tone.js synth error (XP):", e); } }
/** Plays a level-up fanfare if retro sound is enabled. */
function playLevelUpSound() { /* ... (Keep existing logic) ... */ if (!retroSoundEnabled || !synth || typeof Tone === 'undefined' || !Tone.started) return; try { const now = Tone.now(); synth.triggerAttackRelease("C5", "8n", now); synth.triggerAttackRelease("E5", "8n", now + 0.15); synth.triggerAttackRelease("G5", "8n", now + 0.3); synth.triggerAttackRelease("C6", "4n", now + 0.45); } catch (e) { console.warn("Tone.js synth error (LevelUp):", e); } }


// --- Data Management (Export/Import Logic) ---

/**
 * Displays a temporary message related to data actions (export/import).
 */
function displayDataActionMessage(message, success = true) { /* ... (Keep existing logic) ... */ if (!dataActionMessage) return; dataActionMessage.textContent = message; dataActionMessage.className = `text-xs italic mt-2 h-4 ${success ? 'text-green-500' : 'text-red-500'}`; setTimeout(() => { if (dataActionMessage) dataActionMessage.textContent = ''; }, 3000); }
/**
 * Initiates the export of all user data to a JSON file.
 */
function exportUserData() { /* ... (Keep existing logic) ... */ playButtonClickSound(); if (!users || Object.keys(users).length === 0) { displayDataActionMessage("Ingen data å eksportere.", false); return; } if (currentUser && users[currentUser]?.stats) { users[currentUser].stats.exportedData = true; checkAchievements(currentUser); if (firebaseInitialized && usersRef) { usersRef.child(currentUser).child('stats/exportedData').set(true).catch(err => console.error("Failed to update exportedData flag in RTDB", err)); } } try { const dataToExport = JSON.parse(JSON.stringify(users)); Object.values(dataToExport).forEach(user => { if (user.stats?.themesTried instanceof Set) { user.stats.themesTried = Array.from(user.stats.themesTried); } else if (!Array.isArray(user.stats?.themesTried)) { user.stats.themesTried = []; } if (!Array.isArray(user.log)) user.log = []; if (!Array.isArray(user.achievements)) user.achievements = []; }); const dataStr = JSON.stringify(dataToExport, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fit_g4fl_data_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); displayDataActionMessage("Data eksportert!", true); } catch (error) { console.error("Export error:", error); displayDataActionMessage("Eksportfeil!", false); alert(`Eksportfeil: ${error.message}`); } }
/**
 * Handles the file selection for data import.
 */
function handleDataImport(event) { /* ... (Keep existing implementation) ... */
    const file = event.target.files[0];
    if (!file) return;
    if (!firebaseInitialized || !usersRef) {
        alert("Kan ikke importere, Firebase ikke tilkoblet.");
        if (importFileInput) importFileInput.value = '';
        return;
    }
    if (!confirm("ADVARSEL: Dette vil OVERSKRIVE ALL eksisterende data i Firebase med innholdet i filen. Er du helt sikker?")) {
        if (importFileInput) importFileInput.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (typeof importedData !== 'object' || importedData === null) {
                throw new Error("Importert data er ikke et gyldig objekt.");
            }
            console.log("Validating and preparing imported data...");
            const dataToImport = JSON.parse(JSON.stringify(importedData));
            Object.entries(dataToImport).forEach(([username, user]) => {
                const defaultUserStructure = { xp: 0, level: 1, log: [], theme: 'klinkekule', lastWorkoutDate: null, streak: 0, snooped: false, lastLogin: null, achievements: [], stats: { totalWorkouts: 0, totalKm: 0, totalVolume: 0, themesTried: [], timesSnooped: 0, lastMood: null, importedData: false, exportedData: false } };
                dataToImport[username] = { ...defaultUserStructure, ...user };
                dataToImport[username].stats = { ...defaultUserStructure.stats, ...(user.stats || {}) };
                if (!Array.isArray(dataToImport[username].stats.themesTried)) dataToImport[username].stats.themesTried = [];
                if (!Array.isArray(dataToImport[username].log)) dataToImport[username].log = [];
                if (!Array.isArray(dataToImport[username].achievements)) dataToImport[username].achievements = [];
                dataToImport[username].level = getLevelFromTotalXP(dataToImport[username].xp || 0);
            });
            usersRef.set(dataToImport)
                .then(() => {
                    displayDataActionMessage("Data importert og overskrevet i Firebase!", true);
                    alert("Data importert! Appen vil nå bruke den nye dataen (kan kreve refresh eller ny innlogging).");
                    if (currentUser && dataToImport[currentUser]?.stats) {
                        usersRef.child(currentUser).child('stats/importedData').set(true).catch(err => console.error("Failed to update importedData flag", err));
                    }
                })
                .catch(error => {
                    console.error("Firebase import error (set operation):", error);
                    displayDataActionMessage(`Importfeil (Firebase): ${error.message}`, false);
                    alert(`Importfeil (Firebase): ${error.message}`);
                });
        } catch (error) {
            console.error("Import file parse/validation error:", error);
            displayDataActionMessage(`Importfeil (Fil/Data): ${error.message}`, false);
            alert(`Importfeil (Fil/Data): ${error.message}`);
        } finally {
            if (importFileInput) importFileInput.value = '';
        }
    };
    reader.onerror = (e) => {
        console.error("File read error:", e);
        displayDataActionMessage("Fil-lesefeil.", false);
        alert("Kunne ikke lese filen.");
        if (importFileInput) importFileInput.value = '';
    };
    reader.readAsText(file);
}


// --- Mascot & Daily Tip ---

/**
 * Updates the mascot message and adds a small visual effect.
 */
function updateMascot(message) { /* ... (Keep existing logic) ... */ if (mascotMessage) mascotMessage.textContent = message; if (mascotElement) { mascotElement.style.transform = 'scale(1.1)'; setTimeout(() => { if (mascotElement) mascotElement.style.transform = 'scale(1)'; }, 150); } }
/**
 * Displays the daily tip, fetching from cache or generating a new one.
 */
function displayDailyTip() { /* ... (Keep existing logic) ... */ if (!dailyTipContainer) { console.error("Daily tip container not found!"); return; } if (typeof dailyTips === 'undefined' || !Array.isArray(dailyTips) || dailyTips.length === 0) { console.error('dailyTips array is invalid or empty!'); dailyTipContainer.textContent = "Feil: Kunne ikke laste dagens tips."; return; } const today = new Date().toDateString(); let tip = "Laster dagens (hysteriske) tips..."; try { const lastTipDate = localStorage.getItem('fitnessAppLastTipDate'); const cachedTip = localStorage.getItem('fitnessAppLastTip'); if (lastTipDate === today && cachedTip) { tip = cachedTip; console.log("Using cached daily tip."); } else { const now = new Date(); const startOfYear = new Date(now.getFullYear(), 0, 0); const diff = now - startOfYear; const oneDay = 1000 * 60 * 60 * 24; const dayOfYear = Math.floor(diff / oneDay); const tipIndex = dayOfYear % dailyTips.length; tip = `Dagens Tips: ${dailyTips[tipIndex]}`; console.log(`Generated new tip (Index ${tipIndex})`); localStorage.setItem('fitnessAppLastTip', tip); localStorage.setItem('fitnessAppLastTipDate', today); console.log("Cached new tip for today."); } dailyTipContainer.textContent = tip; } catch (error) { console.error("Error displaying daily tip:", error); dailyTipContainer.textContent = "Kunne ikke laste tips pga. feil."; } }

// --- Weekly Features ---

/**
 * Updates features that might change weekly.
 */
function updateWeeklyFeatures() { /* ... (Keep existing logic) ... */ if (!checkStatButton) return; const today = new Date(); const isFriday = today.getDay() === 5; checkStatButton.classList.toggle('hidden', !isFriday); }

// --- Nikko's Special Button ---
/**
 * Toggles the visibility of Nikko's "Buy XP" button.
 */
function toggleNikkoButton(show) { /* ... (Keep existing logic) ... */ if (nikkoBuyXpButton) { nikkoBuyXpButton.style.display = show ? 'inline-block' : 'none'; } }


// --- Event Listener Setup ---

/**
 * Attaches all necessary event listeners to DOM elements.
 * ** Includes listener for NEW log delete buttons. **
 */
function setupBaseEventListeners() {
    console.log("Setting up base event listeners...");
    if (!body) { console.error("CRITICAL: Body element not available for listener setup."); return; }

    // --- User Interaction & Audio Initialization ---
    body.addEventListener('click', initializeAudio, { once: true });

    // --- Theme Buttons ---
    if (themeButtons && themeButtons.length > 0) { themeButtons.forEach(button => { button.addEventListener('click', () => { playButtonClickSound(); setTheme(button.dataset.theme); }); }); }
    else { console.warn("Theme buttons not found or empty!"); }

    // --- View Navigation Buttons ---
    if (viewButtons && viewButtons.length > 0) { viewButtons.forEach(button => { button.addEventListener('click', () => { playButtonClickSound(); setActiveView(button.dataset.view); }); }); }
    else { console.error("View buttons not found or empty!"); }

    // --- Login Form ---
    if (loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); playButtonClickSound(); const selectedUser = userSelect?.value; const enteredPassword = passwordInput?.value; if(statusDisplay) statusDisplay.innerHTML = ''; if (!selectedUser) { alert("Velg bruker."); if(statusDisplay) statusDisplay.textContent = "Velg en bruker fra listen."; return; } if (!users || !users[selectedUser]) { alert("Bruker ikke funnet (prøv å vent litt hvis appen nettopp lastet)."); if(statusDisplay) statusDisplay.textContent = "Brukerdata ikke funnet. Vent eller prøv igjen."; return; } const correctPassword = selectedUser.charAt(0).toLowerCase(); if (enteredPassword && enteredPassword.trim().toLowerCase() === correctPassword) { loginUser(selectedUser); } else { alert("Feil passord."); if(statusDisplay) statusDisplay.textContent = "Feil passord. Hint: Første bokstav i brukernavnet."; if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); } } }); }
    else { console.error("Login form element NOT FOUND!"); }

    // --- Logout Button ---
    if (logoutButton) { logoutButton.addEventListener('click', logoutUser); }
    else { console.error("Logout button element NOT FOUND!"); }

    // --- Workout Form: Exercise Type Change ---
    if (exerciseTypeSelect) { exerciseTypeSelect.addEventListener('change', () => { const type = exerciseTypeSelect.value; if (kgField) kgField.classList.toggle('active', type !== 'Gåtur'); if (repsField) repsField.classList.toggle('active', type !== 'Gåtur'); if (setsField) setsField.classList.toggle('active', type !== 'Gåtur'); if (kmField) kmField.classList.toggle('active', type === 'Gåtur'); if (customExerciseNameField) customExerciseNameField.style.display = (type === 'Annet') ? 'block' : 'none'; const kilosEl = kgField?.querySelector('input'); const repsEl = repsField?.querySelector('input'); const setsEl = setsField?.querySelector('input'); const kmEl = kmField?.querySelector('input'); if (kilosEl) kilosEl.required = (type !== 'Gåtur'); if(repsEl) repsEl.required = (type !== 'Gåtur'); if(setsEl) setsEl.required = (type !== 'Gåtur'); if(kmEl) kmEl.required = (type === 'Gåtur'); if(customExerciseInput) customExerciseInput.required = (type === 'Annet'); }); }
    else { console.error("Exercise Type Select element NOT FOUND!"); }

    // --- Workout Form: Submit (Add Activity) ---
    if (workoutForm) { workoutForm.addEventListener('submit', (e) => { e.preventDefault(); if (!currentUser) { alert("Logg inn først for å legge til aktivitet."); return; } playButtonClickSound(); const type = exerciseTypeSelect?.value; let name = type === 'Annet' ? customExerciseInput?.value.trim() : type; let kilos = 0, reps = 0, sets = 0, km = 0, baseXp = 0, finalXp = 0; let comment = workoutCommentInput?.value.trim() || ''; let mood = document.querySelector('input[name="mood"]:checked')?.value || 'good'; let data = { type, comment, mood }; let isValid = true; let cheatMessage = null; if (type === 'Gåtur') { const kmInput = kmField?.querySelector('input'); km = parseFloat(kmInput?.value); if (isNaN(km) || km <= 0) { alert("Ugyldig verdi for kilometer."); isValid = false; } else if (km > MAX_KM_WALK) { cheatMessage = `Nå jukser du vel litt? ${MAX_KM_WALK} km er maks per gåtur-logg.`; isValid = false; } if(isValid) { baseXp = calculateWalkXP(km); data = { ...data, name: `Gåtur ${km} km`, km }; } } else if (type === 'Annet' || type) { const kgInput = kgField?.querySelector('input'); const repsInput = repsField?.querySelector('input'); const setsInput = setsField?.querySelector('input'); kilos = parseFloat(kgInput?.value); reps = parseInt(repsInput?.value, 10); sets = parseInt(setsInput?.value, 10); if (type === 'Annet' && !name) { alert("Skriv inn navn på 'Annet'-øvelse."); isValid = false; } else if (isNaN(kilos) || isNaN(reps) || isNaN(sets) || kilos < 0 || reps < 1 || sets < 1) { alert("Ugyldige verdier for kg/reps/sets."); isValid = false; } else { if (kilos > MAX_WEIGHT_KG) { cheatMessage = `Nå jukser du! ${MAX_WEIGHT_KG} kg er maks vekt per logg.`; isValid = false; } if (reps > MAX_REPS) { cheatMessage = `Nå jukser du! ${MAX_REPS} reps er maks per logg.`; isValid = false; } } if(isValid) { baseXp = calculateLiftXP(kilos, reps, sets); data = { ...data, name, kilos, reps, sets }; } } else { alert("Velg en aktivitetstype."); isValid = false; } if (cheatMessage) { alert(cheatMessage); showNotification(cheatMessage); isValid = false; } if (isValid) { finalXp = adjustXPForMood(baseXp, mood); data.xp = finalXp; currentWorkout.push(data); renderCurrentSession(); workoutForm.reset(); const moodGood = document.getElementById('mood-good'); if (moodGood) moodGood.checked = true; if (exerciseTypeSelect) exerciseTypeSelect.dispatchEvent(new Event('change')); updateMascot(`La til ${data.name}! Fortsett sånn!`); } }); }
    else { console.error("Workout Form element NOT FOUND!"); }

    // --- Complete Workout Button ---
    if (completeWorkoutButton) { completeWorkoutButton.addEventListener('click', completeWorkout); }
    else { console.error("Complete Workout button element NOT FOUND!"); }

    // --- User List Snoop Button (Event Delegation) ---
    if (userListDisplay) { userListDisplay.addEventListener('click', (e) => { if (e.target.classList.contains('snoop-button')) { playButtonClickSound(); const targetUsername = e.target.dataset.username; if (targetUsername) { showSnoopedLog(targetUsername); if (firebaseInitialized && usersRef && users[targetUsername]) { usersRef.child(targetUsername).update({ snooped: true }).then(() => console.log(`Marked ${targetUsername} as snooped upon in RTDB.`)).catch(error => console.error(`Failed to mark ${targetUsername} as snooped:`, error)); if (currentUser && users[currentUser]?.stats) { usersRef.child(currentUser).child('stats/timesSnooped').set(firebase.database.ServerValue.increment(1)) .then(() => { console.log(`Incremented timesSnooped for ${currentUser} in RTDB.`); if (users[currentUser]?.stats) { users[currentUser].stats.timesSnooped = (users[currentUser].stats.timesSnooped || 0) + 1; checkAchievements(currentUser); } }).catch(error => console.error(`Failed to increment timesSnooped for ${currentUser}:`, error)); } } else { console.warn("Snoop: Firebase not ready or target user missing. Not updating Firebase."); if (users[targetUsername]) users[targetUsername].snooped = true; if (currentUser && users[currentUser]?.stats) { users[currentUser].stats.timesSnooped = (users[currentUser].stats.timesSnooped || 0) + 1; checkAchievements(currentUser); } } console.log(`${currentUser || 'Noen'} snoket på ${targetUsername}`); } } }); }
    else { console.error("User List Display element NOT FOUND for snoop listener!"); }

    // --- Snoop Modal Close Button ---
    if (closeSnoopModalButton) { closeSnoopModalButton.addEventListener('click', () => { playButtonClickSound(); if (snoopModal) snoopModal.classList.remove('show'); }); }
    else { console.error("Close Snoop Modal button element NOT FOUND!"); }
    // --- Snoop Modal Background Click Close ---
     if (snoopModal) { snoopModal.addEventListener('click', (e) => { if (e.target === snoopModal) { playButtonClickSound(); snoopModal.classList.remove('show'); } }); }
     else { console.error("Snoop Modal element NOT FOUND for background click listener!"); }


    // --- Admin Panel Buttons (Call functions from Script 1) ---
    if (adminGiveXpButton) { adminGiveXpButton.addEventListener('click', () => { playButtonClickSound(); if (typeof adminAdjustXp === 'function') { adminAdjustXp(); } else { console.error("adminAdjustXp function not found!"); } }); }
    if (adminAddUserButton) { adminAddUserButton.addEventListener('click', () => { playButtonClickSound(); if (typeof adminAddNewUser === 'function') { adminAddNewUser(); } else { console.error("adminAddNewUser function not found!"); } }); }
    // --- Admin Button in Extras Tab ---
    if (adminExtrasButton) { adminExtrasButton.addEventListener('click', () => { playButtonClickSound(); setActiveView('admin'); }); }

    // --- NEW Admin Event Listeners ---
    if (adminResetUserButton) {
        adminResetUserButton.addEventListener('click', () => {
            playButtonClickSound();
            if (typeof adminResetUser === 'function') {
                adminResetUser(); // Call function from Script 1
            } else { console.error("adminResetUser function not found!"); }
        });
    } else { console.warn("Admin Reset User button not found (check ID: admin-reset-user-button)"); }

    if (adminSaveAchievementsButton) {
        adminSaveAchievementsButton.addEventListener('click', () => {
            playButtonClickSound();
            if (typeof adminSaveChanges === 'function') {
                adminSaveChanges(); // Call function from Script 1
            } else { console.error("adminSaveChanges function not found!"); }
        });
    } else { console.warn("Admin Save Achievements button not found (check ID: admin-save-achievements-button)"); }

    if (adminDeleteUserButton) {
         adminDeleteUserButton.addEventListener('click', () => {
             playButtonClickSound();
             if (typeof adminDeleteUser === 'function') {
                 adminDeleteUser(); // Call function from Script 1
             } else { console.error("adminDeleteUser function not found!"); }
        });
    } else { console.warn("Admin Delete User button not found (check ID: admin-delete-user-button)"); }

    // Add listener to admin user select to populate achievements when user changes
    if (adminUserSelect) {
        adminUserSelect.addEventListener('change', () => {
             // No sound needed for select change
             if (typeof adminPopulateAchievements === 'function') {
                 adminPopulateAchievements(); // Call function from Script 1
             } else { console.error("adminPopulateAchievements function not found!"); }
        });
    } // Existing check for adminUserSelect handles the 'not found' case


    // --- Data Management Buttons ---
    if (saveDataButton) { saveDataButton.addEventListener('click', () => { playButtonClickSound(); if (!firebaseInitialized) { displayDataActionMessage("Firebase ikke tilkoblet! Kan ikke 'lagre'.", false); } else { displayDataActionMessage("Data lagres automatisk til Firebase!", true); } }); }
    if (exportDataButton) { exportDataButton.addEventListener('click', exportUserData); } else { console.error("Export Data button element NOT FOUND!"); }
    if (importDataButton && importFileInput) { importDataButton.addEventListener('click', () => { playButtonClickSound(); importFileInput.click(); }); importFileInput.addEventListener('change', handleDataImport); }
    else { console.error("Import Data button or File Input element NOT FOUND!"); }

    // --- Extras Tab Buttons ---
    if (retroModeButton) { retroModeButton.addEventListener('click', () => { initializeAudio().then(() => { retroSoundEnabled = !retroSoundEnabled; retroModeButton.textContent = `Retro Mode Lyd (${retroSoundEnabled ? 'På' : 'Av'})`; updateMascot(retroSoundEnabled ? "8-bit lyd aktivert! Beep boop!" : "Moderne lydmodus. Smooth."); playButtonClickSound(); }); }); }
    else { console.error("Retro Mode button element NOT FOUND!"); }

    if (motivationButton) { motivationButton.addEventListener('click', () => { playButtonClickSound(); if (typeof motivationMessages !== 'undefined' && motivationMessages.length > 0) { const randomIndex = Math.floor(Math.random() * motivationMessages.length); const randomMessage = motivationMessages[randomIndex]; updateMascot(randomMessage); } else { updateMascot("Fant ingen motivasjon... Prøv igjen?"); } }); }
    else { console.error("Motivation button element NOT FOUND!"); }

    if (checkStatButton) { checkStatButton.addEventListener('click', () => { playButtonClickSound(); renderScoreboard(); setActiveView('scoreboard'); }); }

    // --- Nikko's "Buy XP" Button ---
    if (nikkoBuyXpButton) { nikkoBuyXpButton.addEventListener('click', () => { playButtonClickSound(); const gotchaMessage = "Pay-to-win? Ikke her! 😉 Gotcha, Nikko!"; showNotification(gotchaMessage); updateMascot(gotchaMessage); }); }

    // --- Chat Form Listener (Calls function from Script 3) ---
     if (chatForm) { chatForm.addEventListener('submit', (e) => { e.preventDefault(); if (typeof sendChatMessage === 'function') { sendChatMessage(); } else { console.error("sendChatMessage function not found (Script 3 may not be loaded/defined)."); alert("Chat-funksjonen er ikke tilgjengelig."); } }); }
     else { console.error("Chat Form element NOT FOUND!"); }

    // --- Log Entry Delete Button (Event Delegation) ---
    if (logEntriesContainer) {
        logEntriesContainer.addEventListener('click', (e) => {
            // Find the closest ancestor button with the delete class
            const deleteButton = e.target.closest('.delete-log-button');
            if (deleteButton) {
                playButtonClickSound(); // Optional sound
                const entryId = deleteButton.dataset.entryId;
                // Convert entryId back to number if needed (Date.now() is number)
                const entryIdNum = parseInt(entryId, 10);
                if (!isNaN(entryIdNum)) {
                     handleDeleteLogEntryClick(entryIdNum); // Call the handler function
                } else {
                     console.error("Invalid entryId found on delete button:", entryId);
                }
            }
        });
    } else { console.error("Log Entries Container not found for delete listener setup!"); }


    console.log("Base event listeners setup complete.");
} // --- End of setupBaseEventListeners ---


// --- Run Initialization on DOM Load ---
if (typeof window.appInitialized === 'undefined') {
     window.appInitialized = true;
     document.addEventListener('DOMContentLoaded', initializeApp);
} else {
     console.warn("Initialization script (Script 2) seems to be loaded more than once.");
}
