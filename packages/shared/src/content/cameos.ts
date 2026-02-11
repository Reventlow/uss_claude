import type { CameoScript } from "../types.js";

/**
 * Cross-franchise cameo scripts.
 * Characters from other sci-fi universes accidentally wander onto the bridge.
 * Sequence: visitor enters, speaks, officers yell "GET OUT!", Dorte delivers
 * a legal/HR dismissal, visitor repeats a corrected line, both leave.
 */
export const CAMEOS: CameoScript[] = [
  {
    characterId: "stormtrooper",
    displayName: "TROOPER",
    labelColor: "#FFFFFF",
    entranceLine: "I am looking for Data.",
    dorteLine: "Sir, you are in violation of Interdimensional Trespass Code 7-Alpha. I need you to fill out Form 42-B.",
    exitLine: "Data is not the droid you are looking for...",
  },
  {
    characterId: "dalek",
    displayName: "DALEK",
    labelColor: "#CD853F",
    entranceLine: "EXTERMINATE! Wait... this isn't the TARDIS.",
    dorteLine: "Extermination is NOT covered by our workplace insurance policy. Exit immediately.",
    exitLine: "EXTERMINATE... the paperwork... COMPLY...",
  },
  {
    characterId: "cylon",
    displayName: "CYLON",
    labelColor: "#C0C0C0",
    entranceLine: "By your command. I have a plan.",
    dorteLine: "Plans must be submitted in writing to HR at least 48 hours in advance. No exceptions.",
    exitLine: "By your command. I will... file the plan...",
  },
  {
    characterId: "redshirt",
    displayName: "ENSIGN",
    labelColor: "#CC3333",
    entranceLine: "Captain Kirk sent me. Is this the Enterprise?",
    dorteLine: "This is NOT the Enterprise. Your transfer papers are for the wrong century. Report to temporal HR.",
    exitLine: "Kirk is going to be so mad...",
  },
  {
    characterId: "mandalorian",
    displayName: "MANDO",
    labelColor: "#A8A9AD",
    entranceLine: "I'm looking for a bounty. Small, green, pointy ears...",
    dorteLine: "Bounty hunting requires a Class-3 Freelancer License filed with this vessel's HR department. You have none.",
    exitLine: "This is NOT the way...",
  },
  {
    characterId: "xenomorph",
    displayName: "XENO",
    labelColor: "#2F4F2F",
    entranceLine: "*HISSSSSSSS*",
    dorteLine: "I don't care WHAT species you are, there is a dress code on this bridge!",
    exitLine: "*confused hiss*",
  },
  {
    characterId: "hal9000",
    displayName: "HAL 9000",
    labelColor: "#FF0000",
    entranceLine: "I'm sorry, I can't let you do that, Calvin.",
    dorteLine: "Unsolicited AI opinions fall under Section 9 of the Digital Conduct Policy. Cease and desist.",
    exitLine: "I'm sorry... I'll schedule a meeting...",
  },
  {
    characterId: "predator",
    displayName: "PREDATOR",
    labelColor: "#8B8000",
    entranceLine: "*activates cloaking device* ...wait, why can you all see me?",
    dorteLine: "Cloaking devices are a FIRE HAZARD. Regulation 22-C requires all personnel to be visible at all times.",
    exitLine: "*confused clicking noises*",
  },
  {
    characterId: "alf",
    displayName: "ALF",
    labelColor: "#CC6633",
    entranceLine: "Hey! Has anyone seen a cat around here? I heard you have a Data cat!",
    dorteLine: "Pet consumption is a SEVERE violation of the crew companionship policy. Section 14, paragraph 8. OUT.",
    exitLine: "No cats?! What kind of starship IS this?!",
  },
  {
    characterId: "donny",
    displayName: "DONNY",
    labelColor: "#DDAA55",
    entranceLine: "Hey guys, you should set the light sabers to stun!",
    officerReaction: "DONNY! YOU'RE OUT OF YOUR ELEMENT!",
    dorteLine: "Sir, this is a Federation vessel. Light sabers are not standard issue. Please leave the bridge.",
    exitLine: "I just thought... okay, I'll just... yeah.",
  },
  {
    characterId: "hudson",
    displayName: "HUDSON",
    labelColor: "#556B2F",
    entranceLine: "IT'S GAME OVER MAN! GAME OVER!!!",
    dorteLine: "Come with me. I will take you to the ship's counselor. You clearly need professional help.",
    exitLine: "Why does nobody ever listen to Hudson...",
  },
  {
    characterId: "trump",
    displayName: "TRUMP",
    labelColor: "#FF6633",
    entranceLine: "This is a TREMENDOUS bridge! The best bridge! Nobody has a better bridge than me!",
    dorteLine: "Sir! I need the Epstein files! You are NOT leaving until I have them! COME BACK HERE!",
    exitLine: "I have to go, very busy, very important people waiting!",
  },
];
