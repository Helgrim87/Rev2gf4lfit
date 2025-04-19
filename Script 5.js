// === Script 5: Charting Logic ===
// Contains functions for rendering charts using Chart.js

console.log("Script 5.js loaded: Chart functions defined.");

// Store chart instance globally within this script's scope
// to prevent duplicates when re-rendering the same chart
let xpChartInstance = null;
let totalXpChartInstance = null; // Add instance variable for the total chart

/**
 * Renders a bar chart showing XP earned per weekday for the last 7 days for the current user.
 * Assumes Chart.js library is loaded via CDN in Index.html.
 * Assumes 'currentUser' and 'users' global variables are available from Script 2.js.
 * Assumes CSS variables like '--accent-color-rgb' and '--text-color' are defined for styling.
 */
function renderXpPerDayChart() {
    console.log("Attempting to render XP per day chart for current user...");

    const chartCanvas = document.getElementById('xpPerDayChart');
    const errorElement = document.getElementById('xpChartError'); // Element to display errors

    // Check if Chart.js library is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded! Make sure the CDN link is in Index.html.");
        if (errorElement) errorElement.textContent = "Graf-bibliotek (Chart.js) mangler.";
        return;
    }

    // Check if canvas element exists
    if (!chartCanvas) {
        console.error("Canvas element 'xpPerDayChart' not found.");
        // No need to show error message below canvas if canvas itself is missing
        return;
    }

    // Get the 2D rendering context for the canvas
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) {
        console.error("Failed to get 2D context for chart canvas 'xpPerDayChart'.");
        if (errorElement) errorElement.textContent = "Kunne ikke initialisere graf-lerret.";
        return;
    }

    // Clear any previous error message
    if (errorElement) errorElement.textContent = '';

    // Get user data - check if user is logged in and data exists
    if (!currentUser || !users || !users[currentUser]) {
        console.log("No current user data available for chart.");
        if (errorElement) errorElement.textContent = "Logg inn for å se grafen.";
        // Destroy previous chart instance if user logs out or data is missing
        if (xpChartInstance) {
            xpChartInstance.destroy();
            xpChartInstance = null;
            console.log("Destroyed previous user chart instance (no user data).");
        }
        // Clear the canvas explicitly
         ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        return;
    }

    const userLog = users[currentUser].log;

    // Check if the log exists and is an array
    if (!Array.isArray(userLog)) {
         console.log("User log is missing or not an array, cannot generate chart.");
         if (errorElement) errorElement.textContent = "Ingen loggdata funnet.";
         if (xpChartInstance) { xpChartInstance.destroy(); xpChartInstance = null; }
         ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
         return;
    }
     if (userLog.length === 0) {
        console.log("User log is empty, cannot generate chart.");
        if (errorElement) errorElement.textContent = "Ingen loggførte økter funnet for graf.";
         if (xpChartInstance) { xpChartInstance.destroy(); xpChartInstance = null; }
          ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
         return;
    }


    // --- Process Log Data ---
    console.log("Processing log data for user chart...");
    // Initialize XP sum for each day (Mon=0, Tue=1, ..., Sun=6)
    const xpPerWeekday = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    // Calculate the timestamp for exactly 7 days ago (to include today fully)
    const sevenDaysAgoTimestamp = today.getTime() - 6 * 24 * 60 * 60 * 1000; // 6 days before today
    const sevenDaysAgoDate = new Date(sevenDaysAgoTimestamp);
    sevenDaysAgoDate.setHours(0, 0, 0, 0); // Set to the beginning of that day

    let entriesInPeriod = 0;
    userLog.forEach(entry => {
        // Ensure entry has necessary data
        if (!entry.isoDate || typeof entry.totalXP !== 'number') return;

        try {
            const entryDate = new Date(entry.isoDate);
            // Check if the entry date is valid and within the last 7 days
            if (!isNaN(entryDate.getTime()) && entryDate >= sevenDaysAgoDate) {
                let dayIndex = entryDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                // Adjust index so Monday is 0, Sunday is 6
                dayIndex = (dayIndex === 0) ? 6 : dayIndex - 1;

                if (dayIndex >= 0 && dayIndex < 7) {
                    xpPerWeekday[dayIndex] += entry.totalXP;
                    entriesInPeriod++;
                }
            }
        } catch (e) {
            console.warn("Error processing date for log entry:", entry.isoDate, e);
        }
    });

    console.log(`Processed ${entriesInPeriod} log entries from the last 7 days for user ${currentUser}.`);
    console.log("User XP per weekday (Mon-Sun):", xpPerWeekday);

    // --- Chart Configuration ---
    const chartLabels = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

    // Get colors from CSS variables for theme consistency
    // Provide default fallbacks in case variables are not defined
    const accentColorRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-rgb').trim() || '94, 234, 212';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#e5e7eb';
    const gridColor = `rgba(${accentColorRGB}, 0.1)`;
    const barBgColor = `rgba(${accentColorRGB}, 0.6)`;
    const barBorderColor = `rgb(${accentColorRGB})`;

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'XP Tjente', // Tooltip label
            data: xpPerWeekday,
            backgroundColor: barBgColor,
            borderColor: barBorderColor,
            borderWidth: 1,
            borderRadius: 4, // Add rounded corners to bars
            barPercentage: 0.7, // Adjust bar width relative to category space
            categoryPercentage: 0.8 // Adjust spacing between categories (days)
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allow chart to fill container height
        scales: {
            y: {
                beginAtZero: true, // Start Y axis at 0
                ticks: {
                    color: textColor, // Use theme text color for Y-axis labels
                    precision: 0 // Show integers only on Y-axis
                },
                grid: {
                    color: gridColor // Use theme-based grid line color
                }
            },
            x: {
                ticks: {
                    color: textColor // Use theme text color for X-axis labels (days)
                },
                grid: {
                    display: false // Hide vertical grid lines for cleaner look
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hide legend as there's only one dataset
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker tooltip background
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 4,
                displayColors: false, // Don't show color box in tooltip
                callbacks: {
                    // Custom tooltip label
                    label: function(context) {
                        return `XP: ${context.parsed.y}`;
                    }
                }
            },
            title: { // Add a title to the chart
                 display: false, // Set to true if you want a title above the chart
                 // text: 'Min XP per Ukedag (Siste 7 dager)',
                 // color: textColor,
                 // font: { size: 16 }
            }
        }
    };

    // --- Render Chart ---

    // Destroy previous chart instance if it exists
    if (xpChartInstance) {
        xpChartInstance.destroy();
        console.log("Destroyed previous user chart instance before rendering new one.");
    }

    // Create the new chart
    try {
        xpChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        console.log("User XP per day chart rendered successfully.");
    } catch (error) {
         console.error("Error creating user chart:", error);
         if (errorElement) errorElement.textContent = "Kunne ikke tegne grafen.";
    }
}


/**
 * Renders a bar chart showing TOTAL XP earned per weekday across ALL users for the last 7 days.
 * Assumes Chart.js is loaded via CDN in Index.html.
 * Assumes 'users' global variable is available from Script 2.js.
 * Assumes CSS variables like '--accent-color-rgb' and '--text-color' are defined for styling.
 */
function renderTotalXpPerDayChart() {
    console.log("Attempting to render TOTAL XP per day chart...");

    const chartCanvas = document.getElementById('totalXpPerDayChart'); // Use the new canvas ID
    const errorElement = document.getElementById('totalXpChartError'); // Use the new error ID

    // Check if Chart.js library is loaded
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded!");
        if (errorElement) errorElement.textContent = "Graf-bibliotek (Chart.js) mangler.";
        return;
    }

    // Check if canvas element exists
    if (!chartCanvas) {
        console.error("Canvas element 'totalXpPerDayChart' not found.");
        return;
    }

    const ctx = chartCanvas.getContext('2d');
    if (!ctx) {
        console.error("Failed to get 2D context for chart canvas 'totalXpPerDayChart'.");
        if (errorElement) errorElement.textContent = "Kunne ikke initialisere graf-lerret.";
        return;
    }

    // Clear any previous error message
    if (errorElement) errorElement.textContent = '';

    // Check if users data is available
    if (!users || Object.keys(users).length === 0) {
        console.log("No user data available for total chart.");
        if (errorElement) errorElement.textContent = "Brukerdata ikke funnet for graf.";
        if (totalXpChartInstance) { totalXpChartInstance.destroy(); totalXpChartInstance = null; }
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        return;
    }

    // --- Process Log Data for ALL users ---
    console.log("Processing log data for total chart...");
    const totalXpPerWeekday = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    const today = new Date();
    const sevenDaysAgoTimestamp = today.getTime() - 6 * 24 * 60 * 60 * 1000;
    const sevenDaysAgoDate = new Date(sevenDaysAgoTimestamp);
    sevenDaysAgoDate.setHours(0, 0, 0, 0);

    let totalEntriesInPeriod = 0;

    // Iterate through each user
    Object.values(users).forEach(userData => {
        if (!Array.isArray(userData.log)) return; // Skip users with no log

        // Iterate through the user's log
        userData.log.forEach(entry => {
            if (!entry.isoDate || typeof entry.totalXP !== 'number') return;

            try {
                const entryDate = new Date(entry.isoDate);
                if (!isNaN(entryDate.getTime()) && entryDate >= sevenDaysAgoDate) {
                    let dayIndex = entryDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                    dayIndex = (dayIndex === 0) ? 6 : dayIndex - 1; // Adjust Mon=0, Sun=6

                    if (dayIndex >= 0 && dayIndex < 7) {
                        totalXpPerWeekday[dayIndex] += entry.totalXP;
                        totalEntriesInPeriod++;
                    }
                }
            } catch (e) {
                // Ignore date processing errors for individual entries in total chart
            }
        });
    });

    console.log(`Processed ${totalEntriesInPeriod} total log entries from the last 7 days.`);
    console.log("Total XP per weekday (Mon-Sun):", totalXpPerWeekday);

     if (totalEntriesInPeriod === 0) {
        console.log("No log entries found in the period for any user.");
        if (errorElement) errorElement.textContent = "Ingen loggførte økter funnet for graf.";
         if (totalXpChartInstance) { totalXpChartInstance.destroy(); totalXpChartInstance = null; }
          ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
         return;
    }

    // --- Chart Configuration ---
    const chartLabels = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    const accentColorRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent-color-rgb').trim() || '94, 234, 212';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#e5e7eb';
    const gridColor = `rgba(${accentColorRGB}, 0.1)`;
    const barBgColor = `rgba(${accentColorRGB}, 0.6)`;
    const barBorderColor = `rgb(${accentColorRGB})`;

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'Samlet XP (Siste 7 dager)',
            data: totalXpPerWeekday,
            backgroundColor: barBgColor,
            borderColor: barBorderColor,
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.8
        }]
    };

    const chartOptions = { // Same options as the individual chart for consistency
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
            x: { ticks: { color: textColor }, grid: { display: false } }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 },
                padding: 10, cornerRadius: 4, displayColors: false,
                callbacks: { label: function(context) { return `Total XP: ${context.parsed.y}`; } }
            },
             title: {
                 display: false // Title is already in HTML heading
             }
        }
    };

    // --- Render Chart ---

    // Destroy previous total chart instance if it exists
    if (totalXpChartInstance) {
        totalXpChartInstance.destroy();
        console.log("Destroyed previous total chart instance before rendering new one.");
    }

    // Create the new chart
    try {
        totalXpChartInstance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        console.log("Total XP per day chart rendered successfully.");
    } catch (error) {
         console.error("Error creating total chart:", error);
         if (errorElement) errorElement.textContent = "Kunne ikke tegne samlet graf.";
    }
}


