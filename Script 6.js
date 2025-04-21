// === Script 6: Activity-Specific Comments ===
// Contains arrays of motivational comments categorized by activity type.
// Includes a function to retrieve a random comment suitable for the given activity.

console.log("Script 6.js (v2) loaded: Activity-specific comments defined.");

const activityComments = {
    'Tur': [
        "Frisk luft gjør underverker!",
        "Godt å få strukket på beina!",
        "En fin tur i dag!",
        "Kilometer samles!",
        "Naturterapi på sitt beste!",
        "Ute og trasker!",
        "Tur = bra for kropp og sinn!",
        "Godt tempo!",
        "Utforsker nærområdet!",
        "Fikk noen høydemeter også?",
        "Fin utsikt underveis?",
        "Vandring i det fri!"
    ],
    'Styrke': [
        "Musklene fikk kjørt seg!",
        "Tørket støv av manualene!",
        "Pump i jernet!",
        "Sterkere for hver økt!",
        "Beast mode aktivert!",
        "Løfter tungt i dag!",
        "Ingen snarveier til styrke!",
        "Bygger muskler, stein for stein!",
        "Kjente det brant godt!",
        "Rep etter rep!",
        "God kontakt med musklene!",
        "Styrkeløft er tingen!"
    ],
    'Kardio': [
        "Pulsen fikk kjørt seg!",
        "Svetten siler - herlig!",
        "Godt for hjertet!",
        "Høy intensitet i dag!",
        "Kaloriene fikk bein å gå på!",
        "Utholdenheten bygges!",
        "Full gass!",
        "Energisk økt!",
        "Intervaller eller langkjøring?",
        "Godt jobbet med kondisen!",
        "Kardio-kick!",
        "Pust og pes!"
    ],
    'Løping': [
        "Flyr avgårde!",
        "Asfalten (eller stien) brenner!",
        "Ekte løpeglede!",
        "Ny pers på gang?",
        "Raskere enn vinden!",
        "Godt driv i steget!",
        "Løpeskoene brukes flittig!",
        "Følelsen etter en løpetur!",
        "Løper fra bekymringene!",
        "En runde i nabolaget?",
        "Friskt og fort!",
        "Runner's high!"
    ],
    'Sykling': [
        "Tråkker på!",
        "Mil etter mil på sykkelsetet!",
        "Vind i håret (eller hjelmen)!",
        "Sykkelglede på topp!",
        "Tour de Frøya neste?",
        "Pedalene går rundt!",
        "Fin sykkeløkt!",
        "Landevei eller terreng?",
        "To hjul er alt som trengs!",
        "Sykler seg i form!",
        "Bra tråkk!",
        "Rask og effektiv!"
    ],
    'Skritt': [
        "Hverdagsaktivitet teller også!",
        "Mange skritt samlet i dag!",
        "En aktiv dag!",
        "Skritt for skritt mot målet!",
        "Holder seg i bevegelse!",
        "Går mye i løpet av dagen!",
        "Skrittelleren går varm!",
        "Alle skritt bidrar!",
        "Får inn stegene!",
        "Bra å være på farten!",
        "Opp og stå!",
        "Mange bekker små..."
    ],
    'Annet': [ // For activities without specific category, or generic use
        "God innsats uansett aktivitet!",
        "All bevegelse er bra bevegelse!",
        "Kreativ trening!",
        "Prøver noe nytt?",
        "Variasjon er viktig!",
        "Fikk brukt kroppen!",
        "Bra jobba med *noe*!",
        "Aktivitet fullført!",
        "Energi brukt = bra!",
        "Hva enn det var, bra gjort!",
        "Teller som trening!",
        "Keep it up!"
    ],
    'default': [ // Fallback comments if a type is missing or for general use
        "Kjempebra jobba!",
        "Stå på videre!",
        "Imponerende!",
        "Du gir jernet!",
        "Awesome!",
        "Nailed it! 💪",
        "Fortsett den gode trenden!",
        "Fantastisk innsats!",
        "Godt levert!",
        "Inspirerende å se!",
        "Du er rå!",
        "For en innsats!",
        "Wow!",
        "Helt konge!",
        "Smashing!",
        "Superb!",
        "Strålende gjennomført!",
        "Heia deg!",
        "Solid!",
        "Respekt!",
        "Bravo!",
        "Sånn ja!",
        "Du ruler!",
        "Flammer! 🔥"
    ]
};

/**
 * Selects and returns a random motivational comment suitable for the given activity type.
 * Falls back to 'Annet' or 'default' comments if the specific type has no comments
 * or if the type is not found.
 * @param {string} activityType - The type of activity (e.g., 'Tur', 'Styrke').
 * @returns {string} A random comment relevant to the activity type.
 */
function getRandomComment(activityType) {
    let commentsPool = [];

    // Try to get comments for the specific type
    if (activityType && activityComments[activityType] && activityComments[activityType].length > 0) {
        commentsPool = activityComments[activityType];
    }
    // Fallback 1: Try 'Annet' if specific type is empty or not found
    else if (activityComments['Annet'] && activityComments['Annet'].length > 0) {
        console.warn(`getRandomComment: No specific comments for type "${activityType}", using 'Annet'.`);
        commentsPool = activityComments['Annet'];
    }
    // Fallback 2: Use 'default' if 'Annet' is also empty
    else if (activityComments['default'] && activityComments['default'].length > 0) {
        console.warn(`getRandomComment: No specific or 'Annet' comments for type "${activityType}", using 'default'.`);
        commentsPool = activityComments['default'];
    } else {
        // Absolute fallback if no comments are defined at all
        console.error("getRandomComment: No comment pools available ('specific', 'Annet', or 'default').");
        return "Godt jobbet!"; // Return a very basic default
    }

    // Select a random comment from the chosen pool
    const randomIndex = Math.floor(Math.random() * commentsPool.length);
    return commentsPool[randomIndex];
}

// Example usage (for testing in console):
// console.log("Comment for Tur:", getRandomComment('Tur'));
// console.log("Comment for Styrke:", getRandomComment('Styrke'));
// console.log("Comment for UkjentType:", getRandomComment('Yoga')); // Should fallback
