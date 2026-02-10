import type { GossipExchange } from "../types.js";

/**
 * 60+ gossip exchanges for when the captain is away.
 * Officer assignments are pre-defined to give each pair unique chemistry.
 */
export const GOSSIPS: GossipExchange[] = [
  // --- Other ships' crew behaving badly (~20) ---
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "Did you hear about the crew on the Reliant?",
      "Their captain wore his uniform inside out for THREE days.",
      "Nobody told him. They thought it was a new regulation.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The science officer on the Excelsior claims to have discovered a new element.",
      "Turns out it was just space dust on his scanner.",
      "He'd already named it and submitted a paper.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "The ops team on the Defiant got into a fight over the last ration pack.",
      "It was just emergency field rations. Tasted like cardboard.",
      "Two of them still aren't speaking to each other.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "I intercepted a comm from the Voyager...",
      "Their replicator started producing nothing but banana-flavored everything.",
      "The crew staged a formal protest. In writing.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "Apparently the helmsman on the Prometheus fell asleep at the conn.",
      "The ship did three loops around a moon before anyone noticed.",
      "They called it 'orbital reconnaissance' in the log.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The Intrepid's chief engineer tried to 'improve' the turbolift.",
      "It now only goes sideways.",
      "They've been using the Jefferies tubes for two weeks.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The comm officer on the Saratoga accidentally broadcast karaoke night to the entire sector.",
      "Three ships filed noise complaints.",
      "The Klingons requested an encore.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The lab on the Pasteur had a containment breach last week.",
      "Nothing dangerous — just 200 liters of blue gelatin.",
      "Deck 5 is still sticky.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "You know that officer who transferred from the Galaxy?",
      "Apparently he brought 47 houseplants to his quarters.",
      "Life support had to be recalibrated for the oxygen surplus.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "I heard the Titan's first officer challenged the captain to arm wrestling.",
      "He won. Now there's an 'awkward dynamic' according to the counselor.",
      "Morale reports have been... interesting.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "A cadet on the Enterprise-F accidentally ejected the warp core during a drill.",
      "It was a simulation. He still cried.",
      "They gave him a participation trophy.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The chief medical officer on the Stargazer prescribed 'fresh air' to a crewman.",
      "They're on a starship. IN SPACE.",
      "The holodeck was booked for a week.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The Sovereign's bridge crew started a book club.",
      "First meeting ended in a shouting match over the ending of a Klingon romance novel.",
      "Security was called.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "Did you see the report from Starbase 12?",
      "Someone relabeled all the cargo containers as 'definitely not tribbles.'",
      "It was tribbles. It was always tribbles.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "The Venture's crew tried to replicate a swimming pool on the cargo deck.",
      "Gravity plating failed halfway through filling it.",
      "There's still a water bubble floating near the warp core.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "The night shift on Deep Space 9 has a secret poker game.",
      "Not that secret — Quark is running odds on it.",
      "The station commander 'doesn't know about it' but placed a bet.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "A researcher on the Dauntless tried to teach the ship's cat quantum mechanics.",
      "The cat is now somehow in two rooms at once.",
      "Nobody knows how. Least of all the cat.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The ops chief on the Bradbury recycled the wrong cargo.",
      "Turns out those were diplomatic gifts for the Andorians.",
      "He's been 'reassigned to inventory management' indefinitely.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The Potemkin had a crew talent show last week.",
      "The security chief did interpretive dance about plasma conduit maintenance.",
      "He got a standing ovation and a psych evaluation.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "Someone on the Cerritos wrote fan fiction about the senior staff.",
      "It was anonymously posted on the ship's internal network.",
      "The captain found it 'surprisingly well-written.' Direct quote.",
    ],
  },

  // --- FynBus office situations in space (~20) ---
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "You know how FynBus is always late with the 42 route?",
      "Imagine that but with a shuttlecraft.",
      "The passengers would file complaints in triplicate. Across three star systems.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "I wonder if FynBus drivers would adapt well to warp speed.",
      "They already navigate impossible routes with impossible timetables.",
      "Honestly, they're overqualified for Starfleet.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "The annual safety review would be wild in space.",
      "Item one: 'Emergency evacuation via escape pod — all zones.'",
      "Item two: 'Please remember to validate your zone ticket before entering the escape pod.'",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "I heard the printer on deck 4 jammed again.",
      "In the 24th century. WITH REPLICATORS.",
      "Some things never change.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "Someone put a passive-aggressive note on the replicator.",
      "'Please clean the replicator after making Klingon gagh. This is your workspace too.'",
      "Signed 'The Replicator Fairy.'",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "Our budget meeting is next week.",
      "Last time, they questioned why the science lab needed 'that many test tubes.'",
      "We're on a STARSHIP. Exploring the UNKNOWN.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "The IT ticket system shows 847 open tickets.",
      "Most of them are 'replicator makes coffee too cold.'",
      "Three are actual emergencies. One has been open since stardate 78000.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "We got a memo about 'responsible use of the holodeck.'",
      "Apparently someone used it to simulate being on vacation.",
      "For three weeks. Their department didn't notice.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "The new onboarding process has 74 steps.",
      "Step 23: 'Acknowledge that the replicator's tea is not as good as real tea.'",
      "Step 24: 'Accept this fact and move on.'",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "Someone accidentally replied-all to a ship-wide comm.",
      "It was a lunch order. For one person.",
      "400 people now know Lieutenant Kowalski really likes extra pickles.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The office party planning committee can't agree on a theme.",
      "'Casual Friday' vs 'Formal First Contact.'",
      "It's been 6 meetings. No resolution in sight.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "Someone complained about the air conditioning on deck 9.",
      "We're in a SEALED STARSHIP with ENVIRONMENTAL CONTROLS.",
      "The form was submitted in triplicate anyway.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "The parking situation at the shuttlebay is out of control.",
      "Someone double-parked a runabout.",
      "There's a waiting list for shuttle spots. In space.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "Did you see the new 'desk clean' policy?",
      "All consoles must be 'clutter free' by end of shift.",
      "My console IS a Federation starship helm. It's SUPPOSED to have stuff on it.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "I put in a request for new lab equipment four months ago.",
      "Status: 'Under review by Procurement (Starbase 74).'",
      "I could build the equipment from scratch faster than this.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The wellness committee wants us to do 'stretch breaks' every hour.",
      "In the middle of a Red Alert.",
      "'Shields at 40%! Quick everyone, touch your toes!'",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "Someone keeps microwaving fish in the deck 3 break room.",
      "It's 2380. We have REPLICATORS.",
      "They bring it from home. In a Tupperware. From the Delta Quadrant.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The annual performance review template has been updated.",
      "New field: 'Number of times you saved the ship this quarter.'",
      "Below that: 'Were the proper forms filed beforehand?'",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "We had a fire drill last Tuesday.",
      "Half the crew didn't know where the assembly point was.",
      "It's the SHUTTLEBAY. It's ALWAYS the shuttlebay.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "Gorm's been updating the IT documentation again.",
      "He documented the replicator's quirks. ALL of them.",
      "It's now the longest internal document on the ship.",
    ],
  },

  // --- Technology complaints (~10) ---
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "The universal translator glitched during the ambassador's speech.",
      "Everything came out in Ferengi slang.",
      "The Vulcan delegation was 'not amused.' Their words.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The LCARS update broke the turbolift voice commands.",
      "You say 'Bridge' and it takes you to the brig.",
      "Three ensigns are still trapped.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "The comm badge firmware update went sideways.",
      "Everyone's badge plays a little jingle when tapped now.",
      "The captain's plays the Cantina theme. He doesn't know why.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The ship's AI started adding motivational quotes to all reports.",
      "'Shields at 12%. You miss 100% of the shots you don't take. — Wayne Gretzky'",
      "I can't turn it off. Believe me, I've tried.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "Windows 47 crashed on the auxiliary console again.",
      "You'd think after 400 years they'd fix the blue screen.",
      "At least it's historically accurate.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The subspace antenna picks up ancient Earth radio signals.",
      "We've been listening to a station that only plays 80s synth pop.",
      "Engineering has lodged three complaints. Science wants to study it.",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "I tried to update the sensor array software.",
      "It needs a restart. The ENTIRE sensor array.",
      "We'll be flying blind for 45 minutes while it installs 'critical updates.'",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "The replicator diagnostic says 'all systems nominal.'",
      "It just produced a cup of tea that was somehow simultaneously hot AND frozen.",
      "I'm filing this as a quantum anomaly and moving on.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "Someone connected a vintage Earth device to the ship's network.",
      "It's called a 'Raspberry Pi.' From the 21st century.",
      "It's now running 40% of non-critical systems. Nobody will admit who did it.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The backup system backed up the backup of the backup.",
      "We now have 12 petabytes of recursive backups.",
      "Storage is at 99.7%. The backup of THAT is at 99.8%.",
    ],
  },

  // --- Break room / replicator drama (~10) ---
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "Someone keeps taking my mug from the replicator queue.",
      "It's LABELED. With my NAME.",
      "I've started hiding it in the Jefferies tube on deck 4.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "The break room on deck 7 has a sign: 'Clean up after yourself.'",
      "Below it, someone wrote: 'Computer, clean up after yourself.'",
      "Below THAT: 'I'm sorry, I cannot comply with that request.'",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "Someone programmed the replicator to only serve healthy options after 2100.",
      "The night shift is staging a rebellion.",
      "They've been bartering replicated cookies from the day shift.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "There's a turf war over the good table in mess hall 2.",
      "Alpha shift claims it by tradition. Beta shift by 'strategic need.'",
      "Gamma shift just sits there silently and stares at everyone.",
    ],
  },
  {
    speaker: "glass",
    listener: "jasper",
    lines: [
      "The replicator on deck 3 has developed... a personality.",
      "It sighs before making your order.",
      "Yesterday it asked someone if they were 'sure about the cake.'",
    ],
  },
  {
    speaker: "fizban",
    listener: "glass",
    lines: [
      "Someone left a note in the break room: 'Whoever keeps replicating durian, please stop.'",
      "The reply: 'Freedom of culinary expression is a Federation right.'",
      "Environmental controls disagree.",
    ],
  },
  {
    speaker: "jasper",
    listener: "glass",
    lines: [
      "The coffee club started a rating system for replicator blends.",
      "Blend 47 got one star: 'Tastes like warp plasma. Would not recommend.'",
      "It's now the most ordered blend. Out of spite, apparently.",
    ],
  },
  {
    speaker: "glass",
    listener: "fizban",
    lines: [
      "Lieutenant Torres keeps leaving Klingon opera on in the break room.",
      "The universal translator doesn't soften it. At all.",
      "Morale has dropped 3 points since last Tuesday.",
    ],
  },
  {
    speaker: "fizban",
    listener: "jasper",
    lines: [
      "The hydroponics bay started growing actual coffee plants.",
      "Real coffee. Not replicated.",
      "There's now a black market for it. The exchange rate is three shift-swaps per cup.",
    ],
  },
  {
    speaker: "jasper",
    listener: "fizban",
    lines: [
      "Someone reprogrammed the mess hall chairs to heat up.",
      "It was supposed to be 'cozy.'",
      "Three ensigns got stuck because the seats were slightly melted.",
    ],
  },
];
