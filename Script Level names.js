// === Script Level names.js ===
// Contains constants, configuration, and XP/Level calculation logic.
// Updated with new XP progression logic and new achievements (utfordringer).
// Restored content for dailyTips and motivationMessages.

console.log("Script Level names.js loaded: Constants, NEW XP functions, and restored tips/messages defined.");

// --- CONFIGURATION & CONSTANTS ---

// Firebase Configuration Object
const firebaseConfig = {
    apiKey: "AIzaSyDUC7mBCT4R_t3buPLDrDA-GQWGmYEyBnw", // Example Key
    authDomain: "gf4l-ca7e2.firebaseapp.com",
    databaseURL: "https://gf4l-ca7e2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gf4l-ca7e2",
    storageBucket: "gf4l-ca7e2.appspot.com",
    messagingSenderId: "893712610424",
    appId: "1:893712610424:web:5b0db3683d1aff2667298d"
};

// Level Names Array (Index corresponds to level number)
const levelNames = [
    "Energiløs Latsabb", "Sovende Komapost", "Løftesky Skybert", "Feit Fjøsgris", "7 Days to Diet", // 0-4
    "Lat Ark-ologist", "Star Sloth", "Løpe? Nei Takk", "Vandrende Flesk", "Kaffekoppknekker", // 5-9
    "Sliten Speider", "Jogge-Sabotør", "Dørstokkmila Veteran", "Kardio-Kylling", "Feit Survivor (ARK-edition)", // 10-14
    "Couch Potato 9000", "Zombie-Mat (7 Days)", "Fett i Farlig Fart", "Uninstall Gym Sim", "Dronken Drikkebelte", // 15-19
    "Pulsklokka Streika", "Dinosaurus Feitus (ARK)", "Biceps? Aldri Hørt Om", "Fett i Fritt Fall", "Kompost-latens", // 20-24
    "Rage-Quit Jogger", "Loot-crate Lurker", "Lat Spacefarer", "Aerob-Nekter", "Kondis Kollapse", // 25-29
    "Treig Tek Rex (ARK)", "Matpause-Mester", "Fettfinger Fighter", "Treningsnekter Prime", "Fett-tralla på turbo", // 30-34
    "Kantinemage Commander", "Jaktet av Fett-Raptors", "Fitness Feilstart", "Space-Burger Banditt", "Vegetar-Zombie", // 35-39
    "Fettbrann Slukker", "Varmmat-Veteran", "Overopphetet Kosedress", "Fettgass Farmer", "Fettfiasko Frontier", // 40-44
    "Push-up Pøbel", "Inaktiv Inventar", "Pustepause Pilot", "Kebab-Kriger", "Star Citizen, Feit Edition", // 45-49
    "Latskapens Overlevende", "Fettlaget Explorer", "Base Builder med Burgerbehov", "Ark-Huleboer med Hoffnarrmage", "Løpende Latmann", // 50-54
    "T-Rex med T-skjorte for Trang", "Burpee-Flopper", "Zombiebait med Zumbaangst", "Kardio-Katastrofe", "Dino-napper", // 55-59
    "Løftefobi Lord", "Dodgeball Deserter", "Frityr-Forsvarer", "ARK-noob med ab-crunch-anfall", "Kroppsvekt-Kunstner (uten øving)", // 60-64
    "Feitmen i Rustning", "Gassmaskeglad Gomp (7DTD)", "Loot før Lungene", "Fettkontroller i Freefall", "Star Pølsegutt", // 65-69
    "Pre-workout Panikk", "Hopp over Leg Day", "Kraftig Karbonader", "Fettfredag Fanatiker", "Latmus Prime", // 70-74
    "Fettbuffer Brawler", "Benkpress Beklager", "Sliten Scout (SC)", "Feitest i Fracture Space", "Muffinsmodus Mekaniker", // 75-79
    "Grumpy Gains Gnome", "Struts med Stepskrrekk", "Fettfeita Fleet Commander", "Knestående Kraftløs", "Lat Lystløgner", // 80-84
    "Proteinshake Posør", "Helsefare i Hengekøya", "Superslow Survivor", "Fettfarm Farmer Joe", "Dodge ‘n’ Donuts", // 85-89
    "Vaffel-Veteran", "Zzz-Zone Zero", "Lat på Lave Oksygennivå", "Kraftløs Krigshelt", "Lårskjelver på Lavgear", // 90-94
    "Fett og Farlig i Fjellheimen", "Fett-Enhanced Fighter", "Løpemotstander med Lathetslisens", "Squatless Wonder", "Commander Couchpotato", // 95-99
    "Dodo-Mester Deluxe", "Sulten Bronto på Sukkersjokk", "Kardio-Kråke fra Klatrefobi", "Lat Loot Llama (importert)", "Fettbasert Frontsoldat", // 100-104
    "Star Citizen med Stramme Skritt", "Proteinfiendtlig Pteranodon", "Zombieknekt uten Knekk", "Oksygensvett Overlevingsnarkis", "Dino-Dansende Dessertglad", // 105-109
    "Jetpack-Jan med Jojo-diett", "Pølsepress-Pilot", "Kraftløs Kompanjong (ARK Tribe)", "Feit Feltsjef", "Staminasvak Scout", // 110-114
    "Muffins-Muncher med Minigun", "Lat Latamaster (7DTD versjon)", "Hodeskalle-Henger i Hengekøya", "Tyrannosaurus Trøtt", "Sofa-Strateg i Starbase", // 115-119
    "Donut-Dodo Defender", "Lat-Giga Tammer", "Slapp i Saddle (riding skill: 0)", "Proteinpanisk Pyroman", "Fettfiksert Feral Fighter", // 120-124
    "Fettfiendtlig Flyer", "Buffless Bronto-Bro", "Skritteller-Sabotør", "Svimete Sabertooth", "KardioKollapser i Kommandodrakt", // 125-129
    "Fett-Heavy Heavy", "Lat-Lasher i Light Armor", "Feit Fenrisulv-Fanger", "Couch-Clinger Commander", "Pustepause Paladin", // 130-134
    "Staminasviker i Skyttergrav", "Dessert-Diplomat i Doom", "Svett i Spacetaxi", "Dodo-Fencer", "Bronto-Bouncer med Bakrus", // 135-139
    "Fettpanser Pilot", "Slowmo Sniper (ARK PvE)", "Sulten Survivor med Sideskjegg", "Stappfull Starfarer", "Latstyrt Loot Looter", // 140-144
    "Guffen Giga med Godterisporer", "Svett i Saddelen", "Fettarmada General", "Nap Queen of 7 Days", "Sko-fobisk Speider", // 145-149
    "Deigete Dino-Dompteur", "Buffløse Blærefanter", "Frityr-Favoritten i Fjellbase", "Knebeskytter-Klovn", "Proteinprell på Patrol", // 150-154
    "Respawn-Rebell uten Rundkast", "Fritids-Feiter med Fjernkontroll", "Jetpack-Jabba", "Fettfelgen Fighter", "Dodo-Diver med Donutdiett", // 155-159
    "Loot-Lat på Langtur", "Sitronskviset Scout", "Bronto-Bergenser", "Kraftløs Cargopilot", "Zombie-Zoner på Zumba", // 160-164
    "Saft-Sippende Stegosaurus", "Fett & Furious", "Fettforkledd Farlighet", "Skrittsparedinosaur", "Dessertdrevne Droner", // 165-169
    "Fleskefin Fighter", "Kardiosky Kaptein", "Feit Feltrapportør", "Løpebort-Legende", "Fettstartet Freelancer", // 170-174
    "Skulderklapp-samler", "Zzz-bunker Befaler", "Avocado-Aggressor", "Kalorikarusell Kaprer", "Matpakke-Monark", // 175-179
    "Treige Tek Tyrant", "Cheeto-Chomper fra Citadel", "Svettbaron i Stjernehavn", "Treningsvegrer-Veteran", "Late Loot Lord", // 180-184
    "Dino Dørvakt", "Fett i Fart", "Planleggingsfase-Pegasus", "Muffinsmaskin Mekanikus", "SofaSovereign", // 185-189
    "Latigatoren", "KakeKommandør", "Pauseskjerm-Paladin", "Fettbasert Fangevokter", "Narkoberry-Narkoman", // 190-194
    "Tungtbelastet Tanktop-Tyrann", "Dodo-Diktator", "Bronto-Bamse med Bicepsfrykt", "Loot-Legende på Lavpuls", "Fettfyrst av Fjernlandet", // 195-199
    "Trøtt Tyrannodausaurus", "Sulten Star Whale", "Latsabb på månebase", "Dodo Dronning", "Feit Fjellzombie", // 200-204
    "Bambi på proteinshakes", "Fettberg i romdrakt", "Kokt Kompysalat", "Svett Spino med ølbæltet", "Hardcore Hamsterhjul", // 205-209
    "Bronto som nekta cardio", "Nøtt i Navesgane", "Rømt fra Rec Room", "Dronedame med donuts", "Lat med laserkanon", // 210-214
    "Kompressor-Karen", "Buff, men bare i cutscenes", "AFK Apokalypse", "Ryggsøyle av gummi", "DoomGuy på donutdiett", // 215-219
    "Narkobear i PvE", "Feit Raptor med Crocs", "Vinglete Voxelkonge", "NAKEN OG RASENDE", "T-rex med treningsnekrose", // 220-224
    "Fettleif på hoverboard", "Stakkarslig Space Viking", "Muskelmugg i minibuss", "Kvernet Quetzal", "Pinglepilot i pyro-pyjamas", // 225-229
    "Proteinpudderpresten", "Zombiegamp med glidematte", "Fettbryter 3000", "Spekkhogger på bootcamp", "Dronemage i feil univers", // 230-234
    "BrontoBootyMaster", "Skjelvende skrotløfter", "Latmannsløype Legend", "Sovemodus aktivert", "Baconbaron i baris", // 235-239
    "Tordenfeit Torsk", "PT med PTSD fra leg day", "Sushisamurai på diett", "Feit Fenrisulv med fetisj", "Kompis med knekk i korsryggen", // 240-244
    "Kardio? Nei takk-Kongen", "Dodo Dommedagsprofet", "Dinosaur i dvale", "Snuble-soldat fra Star Marine", "Gåstol Gladiator", // 245-249
    "PvZ: Plantet seg fast", "Aimbot, men for sofaen", "Tjukk i trynet og stolt", "7 Days to Die(t)", "Fettfiasko på fjelltur", // 250-254
    "Overlevelsesekspert i BH", "Prustende Pteranodon", "ProteinPadde", "Zed med Zoomfobi", "Chill-Rex på sykkelsete", // 255-259
    "Fettfarm Farmer", "Rømmende Rumpelunk", "Bootybaron fra Bronto-Bay", "Latlifter fra Lavlandet", "Sulten Sabertooth", // 260-264
    "Kakekriger i kamuflasje", "Ræv-Robot i Rust", "Laktosekriger uten plan", "Treningsnarkoleptiker", "Fettsekk i frontlinja", // 265-269
    "Helikopter-Henning", "Zombiefett med sixpack", "Dino med dødsangst for burpees", "Latskalle fra Lazarus-planet", "Flåsende Fettfirefly", // 270-274
    "Dødens DonutDisippel", "PvP på PizzaPlanet", "Kroppsvekt: JA", "Spacetrooper med strekk", "Proteinrakett med mageknip", // 275-279
    "Fetttrøbbel i Fjordzone", "Svett i Subnautica", "Donut-Dronning fra Duna", "Latlux Lurker", "Fettfuru på måneskinsjogg", // 280-284
    "Suppe-Spino i superundertøy", "Loothoarder med lårkrampe", "Latskapens Overlord", "BootcampBaron av Bø", "Fettfrekvens 9000", // 285-289
    "Buff bak en skjerm", "Dødlig Donutdiplomat", "Steinalder Sumo", "StaminaSkrue", "LatZilla vs KetoKong", // 290-294
    "Dodo med dumbbells", "Fettflukt fra Fjellbase", "Ragequit-Runner", "PoopMaster i PaleoPark", "Leg Day Lost Soul", // 295-299
    "Proteinshake med promille", "Astma-Raptor på el-scooter", "Dodo med donuts og Daddy-issues", "Buff bronto med BHen feil vei", "Zombiekondis som snorker", // 300-304
    "Dverg-Titan med chipsavhengighet", "Fettfløyel i full galopp", "Laserpung på lavkarbo", "Muskel-Jabba fra Mos Espa", "Triceps-T-rex med tomme tanker", // 305-309
    "Snuble-Sabertooth i speedo", "Hardcore-Høne med hjulbeinsfobi", "Kardio-Kraken på karaokebar", "Fettmedaljong i feil univers", "PvE-Pungdyr med pollenallergi", // 310-314
    "Benchpress-Bjørn på bensin", "Kremtoppen fra Katastrofeklanen", "Løpe-Latmask i latex", "Buff-Zombie med boccia-belter", "Kalori-Kalkun fra kantina", // 315-319
    "Lattersjokk i leggings", "Dinosaur med depresjon og dadler", "Svett-Space Marine på sparkesykkel", "Støl i stjernebassenget", "Magemuskel-Mammut med melkeskvulp", // 320-324
    "Overkokt Oviraptor med OCD", "Tyggegummi-Tyrannosaurus", "Donut-Dronning på do", "Rage-Rein i rottetruse", "Oppblåsbar Oppsynsmann", // 325-329
    "Kardio-Kålorm med kampinstinkt", "Fettfiesta på Fjelltoppen", "Zombie med Zumba-angst", "Superlat Søppeldrager", "Fett-fett-fettere fra Frøya", // 330-334
    "Protein-Potet i power-pose", "Stjerne-støgg og stolt", "Lårklask-Lama i latex", "Vræle-Viking på vektreduksjon", "Space-Bacon på springmarsj", // 335-339
    "Donut-Diplodocus med diabetes", "Fettknapp på full guffe", "Kardio-Kompost med krøll", "Latterlig Lat-Lynx", "Gal-Giga med godteskjegg", // 340-344
    "Buff og Blind på samme tid", "Fett-Emo på elipse", "PvP-Pingvin med panikk", "Ryggsekk med rocka rumpe", "Gass-Gigant på grøtdiett", // 345-349
    "Biceps-Bamse med barnebukse", "Muskelfjert fra Månebase", "Bronto-Ballong med blodsukkerfall", "Elg-Eminem i eksistensiell krise", "Latsabb Luchador", // 350-354
    "Galaktisk Gummibjørn", "Pølse-PT fra Pluto", "Spekkgiraff på snur", "Fett-fotograf med fettfilter", "Twerk-T-rex med tinnitus", // 355-359
    "Muskelsløv Muldvarp", "Karbo-Krokodille i krise", "Svette-Sith med situpsfobi", "Fettlokk i fartsdress", "Donut-Direktør på deadline", // 360-364
    "Rølpe-Rav i romdrakt", "Late Lunge-Lama", "BrontoBiff med badering", "Smågodt-Sentinel", "DildoDodo med dumbbells", // 365-369
    "Fett-Utpost i feil galakse", "Muskelmygg i Minecraft", "Ræv-Raptordans", "Kardio-Kylling med kraftig kjøttfeber", "Overkokt Orangutang", // 370-374
    "Zombielår med zitzapper", "Fettfeber på Fjortisnivå", "Musklene sover – hjernen og", "Sitrondiett-Spacecowboy", "Svette-Skorpion med skammekrok", // 375-379
    "Benpresse-Bjørn med bleie", "Fett-Bard i bikini", "Donut-Dreper med dystopi-diett", "Astro-Latsabb på lavblods", "Muskelfritt Marsvin", // 380-384
    "Kalorikrig med knyttneve", "Pinglepilot med papirlår", "Tynnfeit Triceratops", "Proteinpirat på plattform", "Space-Kebab med kastestjerner", // 385-389
    "Fettvulkan med frityrfett", "Mageknip-Mantis på monsterenergi", "Kake-Kriger fra Kandisbyen", "Burpee-baron med brokk", "Kardio-Klovn med krokfot", // 390-394
    "PvE-Prest med pumptrack-prestisje", "Rage-rein med ryggsår", "Donut-Spion med dobbelt hake", "Fett-Apokalypse nå", "Muskelsvinnets Messias", // 395-399
    "Kardio-Kadaverdans", "Fett-Fury fra Fjæra", "ZombieSquats med zombietid", "Lårskjelver med laservåpen", "Proteinpudding på pansersko", // 400-404
    "Kalori-Kanari", "Fett-sfinx med stretchbukse", "Triceps-Tyrann med T-rex-trøkk", "Zumba-Zombie på Zoloft", "BrontoBokser på baris", // 405-409
    "FettFiasko fra Fortnite", "Hormon-Hamster på Hula-hoop", "Svette-Sergeant på sofa", "Kardio-Koala med cupcake-fobi", "Gasspingvin med gains", // 410-414
    "Latlapp i latex", "Pølseprins fra Prolapsplanet", "Donut-godzilla med diabetes deluxe", "Muskeldiktator i Minecraft-misjon", "Protein-Pikachu på puddingkur", // 415-419
    "Fettbombe med føtter", "DinoDandy med dustete dumbbells", "Rævrevnet Robot", "Galaktisk Gulasj-Gamer", "PvP-Panda på paracet", // 420-424
    "Fett-fantom i Fortnite-fly", "Zombiefjes på fjelltur", "Muskel-Marit med melkesyre", "Oppblåsbar Ostepopp", "Kardio-Karate Kid", // 425-429
    "Dinosaur med dataspilldepresjon", "Lat-Kommando med kakekanon", "Fettpåfyll fra Fiasko-planet", "Dumbbell-Dobby i dobeltdose", "FjertFit 9000", // 430-434
    "Kardio-Krøpling i krykker", "Trenings-Taco på tur", "Ræv-Raider fra Rust", "Fett-Oracle med Oculus Rift", "DodoDiktator med dumbbells", // 435-439
    "Zombie med Zeppeliner", "Kosedyr-Kung Fu", "Donut-deadlift Disaster", "Muskelflukt fra Mummidalen", "Latterlig Latmageddon", // 440-444
    "PvE-Potet i panicmode", "Kardio-Kalkun fra Katteplaneten", "Protein-Preben på puddingprosjekt", "Fett-Fantom i Froskehopp", "Dumbbell-Direktør med databriller", // 445-449
    "Triceps-Tragedie på tredemølle", "Magefett-Megatron", "Svett-Spacelord på sofaferd", "DodoDoom på donuts og despair", "Fettspøkelse i Fortnite", // 450-454
    "Kardio-Krise-Kristian", "Muskeldamp fra Minecraft-minen", "PvE-Prinsessa på pølseløft", "Fettflagg i flammer", "Dumbbell-Deimos i dorullrustning", // 455-459
    "Kalori-Kriger fra Kuskitkroken", "Fett-Kake-Krutt", "Svett-Zebra på zzz-piller", "Muskel-Mekker på melkekur", "DodoDommedag", // 460-464
    "Kardio-Klovn i krabbegir", "ProteinPiraya fra Planet P", "Fett-Fiesta på fullstendig feil planet", "Snuble-Saber-Tooth i snøstorm", "Zombieløft med ZZZ-top", // 465-469
    "Lat-Lord av Lavt Stamina", "T-rex-Tøffing med treningsvegring", "Donut-Predator på Pogo-stick", "KardioKlaus med kakekaos", "Muskel-Mutant i muffinsmodus", // 470-474
    "Fett-Bastion av Bobleplast", "Snorke-Sith på snappekur", "Protein-Pappskalle på Planet Fit", "Pølse-Paladin fra PvP-Paradiset", "Fett-Fabel fra Fjellfiaskoen", // 475-479
    "Latskapens Lorax", "Donut-Demon i DodoDrakt", "FettFighter 4000", "Kardio-Kongle på karbo-kick", "Muskler i minus med monster-trøkk", // 480-484
    "Rage-Raider på Ribbebuffet", "Fettmekker fra Fjordby", "Dumbbell-Drage med diett-trøbbel", "Svette-Sau fra StarBase", "Bronto-Beist på burgerkurs", // 485-489
    "Zumba-Zebra med zombielus", "Kardio-Karambola", "Feit Farao fra Fortnite", "Lat-Lynx med laserbiceps", "Muffin-Master fra Muskelverden", // 490-494
    "PvE-Pølse i pappkropp", "Fett-Kriger i Fortnite-Fjell", "Donut-Darklord med dadelbiceps", "ZombieZillah på Zzz-top", // 495-499
    "Overpowered Super Gamer! 💪🕹️👑", // 500
];

// Maximum level achievable
const MAX_LEVEL = 500; // Should match the highest index used in levelNames

// Emojis displayed at certain level thresholds
const levelEmojis = {
    0: '🌱', 10: '⭐', 20: '💪', 30: '🔥', 40: '🏆', 50: '👑',
    75: '💎', 100: '🚀', 150: '🌌', 200: '🌠', 250: '💫',
    300: '✨', 400: '🤯', 499: '💯' // Emoji for level 499+
};

// Array of daily tips - RESTORED
const dailyTips = [
    "Husk: Å løfte vekter er bare å overbevise tyngdekraften om å ta en pause. Vær overbevisende!",
    "Svette er bare fettceller som gråter. Få dem til å hulke!",
    "Pro Tip: Hvis du ikke klarer å åpne syltetøyglasset etter armøkta, har du trent riktig. Bestill pizza.",
    "Husk å puste under trening! Oksygen er viktig for... vel, alt. Spesielt for å klage over hvor tungt det er.",
    "Motivasjon: Tenk på alle hatersene! ...Eller bare tenk på at sofaen føles MYE bedre etter en økt.",
    "Kardio? Mener du løfting av vekter i høyt tempo?",
    "'Rest day' betyr ikke 'cheat day'. Med mindre 'cheat' betyr å spise en ekstra brokkoli.",
    "Vann er viktig! 100% av unnskyldningen for å ta en pause.",
    "Ikke hopp over leg day! Du vil vel ikke se ut som en kylling på steroider?",
    "Fremgang er fremgang. Selv det å gå fra sofaen til kjøleskapet er bevegelse!",
    "Muskelsmerter er bare svakhet som forlater kroppen. Eller så løftet du feil. 50/50 sjanse.",
    "Rom ble ikke bygget på en dag. Men de trente sikkert bein hver dag.",
    "Drikk proteinshake etter trening! Det er som en high-five til musklene dine.",
    "Sett deg mål! F.eks: Å kunne bære alle handleposene på én gang.",
    "Selv den tregeste skilpadden fullfører løpet... spesielt hvis haren stopper for å ta selfies.",
    "Husk å varme opp! Kalde muskler er like nyttige som en Star Citizen-server uten spillere.",
    "Dagens mål: Løft noe så tungt at du ser dine forfedre... eller i det minste stjerner.",
    "Ikke sammenlign deg med andre på gymmet. De har sikkert jukset med save files, som i ARK.",
    "Riktig teknikk > tunge vekter. Med mindre du vil låse opp 'Sykehusbesøk'-achievementen.",
    "Kaffe før trening? Ja takk! Koffein er naturens egen pre-workout, bedre enn Gulag-kaffen i Warzone.",
    "Spilte du for lenge i går? En kort økt i dag er bedre enn å bli raidet av dårlig samvittighet.",
    "Husk at selv i 7 Days To Die må du ut og bevege deg for å finne loot. Tenk på trening som looting for helsa.",
    "Star Citizen loading screen = perfekt tid for et sett med push-ups!",
    "Ikke la helsebaren din bli like lav som etter en boss fight i ARK.",
    "Tenk på trening som grinding. XP-en du får er ekte!",
    "Mer utholdenhet IRL = mer utholdenhet til lange gaming sessions.",
    "Du kan ikke respawne helsa di. Ta vare på den du har!",
    "Husk at 'stamina' ikke bare er en bar i spillet.",
    "Å løfte vekter er som å legge skill points i 'Strength'.",
    "Vær like dedikert til trening som til å bygge den perfekte basen i ARK eller 7D2D."
];

// Array of motivational messages for the mascot/motivation button - RESTORED
const motivationMessages = [
    "Bruker du mer tid på å optimalisere gaming-riggen enn kroppen din? Bare lurer...",
    "Husk at 'grinding' i spill gir virtuelle rewards. Grinding på gymmen gir... vel, mindre 'deg' å drasse på.",
    "Du trenger ikke bli verdensmester i løfting, bare litt mindre mester i sofagriseri.",
    "Tenk på det: Hver rep er en 'fuck you' til den buksa som ikke passer lenger.",
    "Du er rå i gaming! Men kan du løpe fra en zombie IRL (som i 7 Days to Die)? Kanskje på tide å øve litt?",
    "Hvorfor går du ikke ned i vekt? Kanskje fordi musa veier mindre enn manualen?",
    "Vær fornøyd med deg selv! Men vær *litt* mer fornøyd etter en økt. Det er lov.",
    "Du knuser det i Warzone, men hva med krigen mot dørstokkmila?",
    "Husk: Å være 'Overpowered' i spill er kult. Å være 'Overvektig' er... mindre kult.",
    "Selv en 'Noob' kan løfte noe. Start der.",
    "Tenk på neste LAN: Vil du være han som trenger to stoler, eller han som *kan* bære PC-en sin selv?",
    "Du klarer å raide i 10 timer, men klarer ikke 10 push-ups? Prioriteringer, min venn!",
    "Hver svettedråpe er en achievement unlocked: 'Overlevde Trening'.",
    "Du trenger ikke sixpack. Men å kunne se tærne dine igjen hadde vært en fin bonus, ikke sant?",
    "Gaming-skills er overførbare! Disiplin, fokus, utholdenhet... bruk det på trening!",
    "Husk: Kroppen din er den ultimate spillkonsollen. Ikke la den samle støv som en gammel PS2.",
    "Litt trening nå, så smaker den ølen/pizzaen/brusen *enda* bedre etterpå. Vitenskap!",
    "Du er ikke lat, du er bare i 'energy saving mode'. På tide å bytte til 'performance mode'!",
    "Se på det som å levle opp den viktigste karakteren av alle: Deg selv.",
    "Ok, du er kanskje ikke raskest på 60-meteren. Men du kan bli raskere enn han du var i går!",
    "Er 'buffering' det eneste buffe du får om dagen?",
    "Husk: Sofaen er lava! ...eller i hvert fall en vortex som suger til seg gainz.",
    "Du vet du bør trene når du blir andpusten av å gå til postkassa.",
    "Sixpack er overvurdert. Men å ikke ha 'one-pack' er et greit mål.",
    "Husk den følelsen etter trening? Nei? Da er det på tide å føle den igjen!",
    "Du bruker timer på å finne den perfekte builden i spillet. Hva med 'builden' din IRL?",
    "Husk: 'Jeg starter i morgen' er den største løgnen siden 'The cake is a lie'.",
    "Selv om du har 'god-mode' i spill, har ikke kroppen din det. Ta vare på den!",
    "Husk: Å løfte vekter er billigere enn å kjøpe nye klær hele tiden.",
    "Du trenger ikke løpe maraton. Bare løp fra dine egne unnskyldninger.",
    "Husk: Styrke handler ikke bare om muskler, men om å faktisk *gidde*.",
    "Du vet hva som er tyngre enn den vekta? Angeren over å ikke ha trent.",
    "Husk: Å bestille mat via app er ikke kardio.",
    "Du klarer å trykke 'Continue' etter en wipe i ARK. Du klarer å ta ett sett til.",
    "Husk: 'Respawn point' finnes ikke på sykehuset.",
    "Den eneste 'easy mode' i livet er den du skrur av når du begynner å trene.",
    "Husk: Å se på treningsvideoer på YouTube teller ikke som trening.",
    "Du trenger ikke være Arnold. Bare prøv å ikke se ut som Jabba the Hutt.",
    "Husk: Fremgang, ikke perfeksjon. Med mindre du er en robot. Er du en robot?",
    "Du vet du må trene når 'Player 2 has entered the game' refererer til dobbelthaka di.",
    "Husk: Å klage brenner null kalorier.",
    "Du klarer å lære komplekse spillmekanikker i Star Citizen. Du klarer å lære knebøy.",
    "Husk: Den beste tiden å starte var i går. Den nest beste er NÅ.",
    "Du trenger ikke elske trening. Bare hat å være i dårlig form *mer*.",
    "Husk: Hver økt er en investering i din fremtidige gaming-utholdenhet.",
    "Du vet det er på tide når trapper føles som en boss fight.",
    "Husk: 'Lag' er ikke en unnskyldning for dårlig kondis.",
    "Du er sjefen over din egen kropp. Ikke la sofaen være nestleder.",
    "Husk: Selv en kort økt er uendelig mye bedre enn ingen økt.",
    "Slutt å lese dette og kom deg på trening! Gulagen venter ikke!",
    "Er du like redd for manualer som for en Alpha Raptor?",
    "Bygg muskler, ikke bare en fancy base i 7 Days.",
    "Tenk på vektene som loot drops for kroppen din.",
    "'One more rep!' er som 'One more turn!' i Civ, bare sunnere.",
    "Kroppen din er ikke proceduralt generert, du må bygge den selv!",
    "Mindre tid på load screens, mer tid på løfting!",
    "Ikke la 'body fat percentage' bli høyere enn din K/D ratio.",
    "Trening: Den eneste grinden der du faktisk blir sterkere IRL.",
    "Dropp unnskyldningene som du dropper dårlig loot.",
    "Er sofagropen din dypere enn Mariana-gropen?"
];

// Achievement definitions: Structure for defining achievements
const achievementList = [
    // --- Existing Achievements ---
    { id: 'lvl5', name: 'Nivå 5!', description: 'Nådde nivå 5. Du er ikke lenger en total potet!', criteria: (user) => user.level >= 5 },
    { id: 'lvl10', name: 'Nivå 10!', description: 'Nådde nivå 10. Velkommen til klubben!', criteria: (user) => user.level >= 10 },
    { id: 'lvl25', name: 'Nivå 25!', description: 'Nådde nivå 25. Halvveis til legende?', criteria: (user) => user.level >= 25 },
    { id: 'lvl50', name: 'Nivå 50!', description: 'Halvveis til hundre (nesten)!', criteria: (user) => user.level >= 50 },
    { id: 'first_workout', name: 'Første Økt Logget', description: 'Du tok det første steget!', criteria: (user) => user.log?.length >= 1 },
    { id: 'ten_workouts', name: 'Ti Økter Fullført', description: 'Du begynner å få teken på det!', criteria: (user) => user.stats?.totalWorkouts >= 10 },
    { id: 'walk10k', name: 'Gått 10 km', description: 'Du har gått minst 10 km totalt.', criteria: (user) => user.stats?.totalKm >= 10 },
    { id: 'lift10ton', name: 'Løftet 10 Tonn', description: 'Du har løftet over 10 000 kg totalt!', criteria: (user) => user.stats?.totalVolume >= 10000 },
    { id: 'snooper', name: 'Nysgjerrigper', description: 'Du brukte Snoke-knappen for første gang.', criteria: (user) => user.stats?.timesSnooped >= 1 },
    { id: 'theme_explorer', name: 'Tema-Utforsker', description: 'Du har prøvd minst 3 forskjellige temaer.', criteria: (user) => user.stats?.themesTried instanceof Set && user.stats.themesTried.size >= 3 },
    { id: 'ark_taming', name: 'Første Gange?', description: 'Fullførte din første "taming"-økt (logget en økt).', criteria: (user) => user.log?.length >= 1 },
    { id: 'zombie_survival_7', name: 'Overlevd Horde Night', description: 'Logget økter 7 dager på rad (Ukes-streak!).', criteria: (user) => user.streak >= 7 },
    { id: 'star_citizen_cargo_heavy', name: 'Cargo Hauler (Tung)', description: 'Løftet over 50 tonn totalt (50 000 kg).', criteria: (user) => user.stats?.totalVolume >= 50000 },
    { id: 'warzone_gulag_winner', name: 'Gulag Vinner', description: 'Kom tilbake etter en hviledag og logget en økt.', criteria: (user) => user.log?.length > 1 && user.streak === 1 },
    { id: 'ark_rex_strength', name: 'Sterk som en Rex', description: 'Løftet over 100 tonn totalt.', criteria: (user) => user.stats?.totalVolume >= 100000 },

    // --- NEW Achievements (15 Individual + 3 Group Placeholders) ---
    // Level Milestones
    { id: 'lvl100', name: 'Nivå 100!', description: 'Tresifret! Nå snakker vi!', criteria: (user) => user.level >= 100 },
    { id: 'lvl150', name: 'Nivå 150!', description: 'Godt over middels!', criteria: (user) => user.level >= 150 },
    { id: 'lvl200', name: 'Nivå 200!', description: 'Dobbelt så rått som 100!', criteria: (user) => user.level >= 200 },
    { id: 'lvl250', name: 'Nivå 250!', description: 'Halvveis til MAX!', criteria: (user) => user.level >= 250 },
    { id: 'lvl300', name: 'Nivå 300!', description: 'Legendarisk status nærmer seg.', criteria: (user) => user.level >= 300 },
    { id: 'lvl400', name: 'Nivå 400!', description: 'Du er en maskin!', criteria: (user) => user.level >= 400 },
    { id: 'lvl500', name: 'Nivå 500! MAX LEVEL!', description: 'Du har rundet spillet! Overpowered!', criteria: (user) => user.level >= 500 },
    // Streak Milestones
    { id: 'streak14', name: 'To Ukers Streak!', description: 'Logget økter 14 dager på rad.', criteria: (user) => user.streak >= 14 },
    { id: 'streak30', name: 'Måneds-Streak!', description: 'Logget økter 30 dager på rad.', criteria: (user) => user.streak >= 30 },
    { id: 'streak60', name: 'To Måneders Streak!', description: 'Logget økter 60 dager på rad. Imponerende!', criteria: (user) => user.streak >= 60 },
    // Total Volume Milestones
    { id: 'lift250ton', name: 'Løftet 250 Tonn', description: 'Du har løftet kvart million kg totalt!', criteria: (user) => user.stats?.totalVolume >= 250000 },
    { id: 'lift500ton', name: 'Løftet 500 Tonn', description: 'Halv million kg! Sterkt!', criteria: (user) => user.stats?.totalVolume >= 500000 },
    // Total Distance Milestones
    { id: 'walk100k', name: 'Gått 100 km', description: 'Du har gått 100 km totalt. Det er langt!', criteria: (user) => user.stats?.totalKm >= 100 },
    { id: 'walk500k', name: 'Gått 500 km', description: 'Du har gått 500 km totalt. Nesten Frøya rundt!', criteria: (user) => user.stats?.totalKm >= 500 },
    // Feature Usage
    { id: 'theme_master', name: 'Tema-Mester', description: 'Du har prøvd alle tilgjengelige temaer!', criteria: (user) => {
        const availableThemes = ['kennyball', 'nikko', 'klinkekule', 'helgrim', 'krrroppekatt', 'beerbjorn', 'dardna', 'skytebasen'];
        return user.stats?.themesTried instanceof Set && availableThemes.every(theme => user.stats.themesTried.has(theme));
    }},

    // --- Group Achievement Placeholders (Logic TBD) ---
    { id: 'group_lift_elephant', name: 'Felles Løft: 1 Elefant!', description: 'Gjengen har samlet løftet 5 000 000 kg (5000 Tonn)!', criteria: (usersData) => false }, // Placeholder
    { id: 'group_walk_froya', name: 'Felles Gåtur: Frøya Rundt!', description: 'Gjengen har samlet gått 100 km!', criteria: (usersData) => false }, // Placeholder
    { id: 'group_all_lvl_50', name: 'Alle Over Nivå 50!', description: 'Alle aktive brukere i gjengen har nådd nivå 50!', criteria: (usersData) => false }, // Placeholder
];

// --- BASE XP CALCULATION (Unchanged) ---

const XP_PER_KM = 50;
function calculateLiftXP(kilos, reps, sets) { const validKilos = Math.max(0, Number(kilos) || 0); const validReps = Math.max(1, Number(reps) || 1); const validSets = Math.max(1, Number(sets) || 1); return Math.round((validKilos * validReps * validSets) / 10); }
function calculateWalkXP(km) { const validKm = Math.max(0, Number(km) || 0); return Math.round(validKm * XP_PER_KM); }
function adjustXPForMood(baseXP, mood) { const multipliers = { great: 0.9, good: 1.0, ok: 1.05, meh: 1.1, bad: 1.2 }; const multiplier = multipliers[mood] || 1.0; return Math.max(1, Math.round(baseXP * multiplier)); }


// --- NEW XP PROGRESSION LOGIC ---

/**
 * Calculates the XP needed to gain a specific level (i.e., go from level L-1 to L).
 * Formula: 10 + (Level - 1) XP. Minimum 10 XP for level 1.
 * @param {number} level - The level being gained (e.g., level=1 means going from 0 to 1).
 * @returns {number} - XP required for this specific level increase.
 */
function getXPForLevelGain(level) {
    level = Math.max(0, Math.floor(level)); // Ensure level is a non-negative integer
    if (level === 0) return 0; // Level 0 requires 0 XP gain
    if (level === 1) return 10; // Base case for level 1
    // Formula: 10 + (L-1)
    return 9 + level;
}

/**
 * Calculates the *total* cumulative XP required to *reach* a specific level.
 * Uses the derived mathematical formula for efficiency.
 * Formula: 9L + L*(L+1)/2
 * @param {number} targetLevel - The target level (e.g., level=3 means reaching the start of level 3).
 * @returns {number} - Total cumulative XP required to reach the start of targetLevel.
 */
function getTotalXPForLevel(targetLevel) {
    targetLevel = Math.max(0, Math.floor(targetLevel)); // Ensure level is non-negative integer
    if (targetLevel === 0) return 0;
    // Use the derived formula: 9L + L*(L+1)/2
    const totalXP = (9 * targetLevel) + (targetLevel * (targetLevel + 1)) / 2;
    return Math.floor(totalXP); // Ensure integer result
}

/**
 * Determines the user's current level based on their total accumulated XP.
 * Uses iteration and compares against the total XP required for each level.
 * More robust than trying to invert the formula, especially with potential future formula changes.
 * @param {number} totalXP - The user's total accumulated XP.
 * @returns {number} - The calculated current level (integer), starting from 0, capped at MAX_LEVEL.
 */
function getLevelFromTotalXP(totalXP) {
    totalXP = Math.max(0, Math.floor(totalXP || 0)); // Ensure non-negative integer XP

    let currentLevel = 0;
    let xpRequiredForNextLevel = getTotalXPForLevel(currentLevel + 1); // XP needed to reach level 1

    // Iterate through levels until the required XP exceeds the user's total XP
    while (totalXP >= xpRequiredForNextLevel && currentLevel < MAX_LEVEL) {
        currentLevel++;
        // Optimization: Check if we've already hit max level
        if (currentLevel >= MAX_LEVEL) {
            break;
        }
        xpRequiredForNextLevel = getTotalXPForLevel(currentLevel + 1);
    }

    // Return the calculated level (which is the last level threshold the user passed)
    return currentLevel; // Already capped by the loop condition
}


console.log("Script Level names.js: NEW XP functions and NEW achievements added.");

