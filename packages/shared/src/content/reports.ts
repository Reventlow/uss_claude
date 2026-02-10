import type { OfficerName } from "../types.js";

/**
 * Star Trek-themed report lines for each officer.
 * Displayed as speech bubbles when officers report to the captain
 * after completing an MCP task.
 */

/** GLASS — Comms officer (service desk tickets) */
const GLASS_REPORTS: string[] = [
  "Hailing frequencies closed, Captain. Ticket resolved.",
  "Incoming transmission handled. The channel is clear.",
  "Subspace comm routed and logged, sir.",
  "Comm traffic sorted. All frequencies nominal.",
  "Distress signal acknowledged and responded to, Captain.",
  "The requester has been hailed. Awaiting their reply.",
  "Priority one message delivered, sir.",
  "Comm relay updated. Signal strength is optimal.",
  "Transmission decoded and ticket dispatched.",
  "All channels monitored. Nothing further to report.",
  "Open channel secured. The matter is in hand.",
  "Long-range comm sweep complete, Captain.",
  "Diplomatic pouch processed and sealed.",
  "Starfleet Command has been notified, sir.",
  "Frequency locked. Response sent on all bands.",
  "Incoming request logged at Stardate... now.",
  "Bridge comms are clear. Standing by for further orders.",
  "Encrypted channel established and message relayed.",
  "Comm log updated. All transmissions accounted for.",
  "Signal intercepted, decoded, and filed, Captain.",
];

/** FIZBAN — Science officer (documentation search) */
const FIZBAN_REPORTS: string[] = [
  "Sensor sweep complete, Captain. Data compiled.",
  "Analysis cross-referenced with the ship's database.",
  "Long-range scans confirm the findings, sir.",
  "I've run the numbers twice. The data is sound.",
  "Tricorder readings verified against Starfleet records.",
  "Fascinating. The results are... as expected.",
  "Spectral analysis complete. Uploading to the main computer.",
  "Library computer cross-reference yielded relevant entries.",
  "Preliminary findings logged, Captain. Recommend further study.",
  "The data is consistent with known parameters.",
  "Quantum analysis yields no anomalies, sir.",
  "Sensor array recalibrated. Readings are clean.",
  "Federation database query returned positive matches.",
  "Science station reports all within normal parameters.",
  "I've located the relevant data, Captain. Transferring now.",
  "The readings are... fascinating. Logged for review.",
  "Astrometric analysis complete. Chart updated.",
  "All variables accounted for. The conclusion is logical.",
  "Scan results nominal. No further anomalies detected.",
  "Research log updated. The record is complete, sir.",
];

/** JASPER — Ops officer (email management) */
const JASPER_REPORTS: string[] = [
  "Cargo manifest sorted, Captain. All accounted for.",
  "Resource allocation updated. Systems nominal.",
  "Logistics routed through the proper channels, sir.",
  "Power distribution optimized across all decks.",
  "Incoming supplies catalogued and stowed.",
  "Ops confirms — all departments have been notified.",
  "Duty roster updated. Crew assignments logged.",
  "System maintenance scheduled and confirmed.",
  "Priority dispatches forwarded to the right departments.",
  "Inventory reconciled, Captain. Nothing out of place.",
  "All departmental requests processed and filed.",
  "EPS conduits balanced. Operations running smooth.",
  "Ship's internal comms sorted, sir. All clear.",
  "Supply chain verified. Requisitions approved.",
  "Crew notifications dispatched on schedule.",
  "Operational readiness confirmed across all sections.",
  "Administrative backlog cleared, Captain.",
  "Internal routing complete. All messages delivered.",
  "Systems check passed. Ops station standing by.",
  "Shift reports compiled and forwarded, sir.",
];

/** Map of officer names to their report lines */
const REPORT_LINES: Record<OfficerName, string[]> = {
  glass: GLASS_REPORTS,
  fizban: FIZBAN_REPORTS,
  jasper: JASPER_REPORTS,
};

/** Get a random report line for the given officer */
export function getRandomReport(officer: OfficerName): string {
  const lines = REPORT_LINES[officer];
  return lines[Math.floor(Math.random() * lines.length)];
}
