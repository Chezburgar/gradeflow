import { XMLParser } from "fast-xml-parser";
import {
  parseAttendance,
  parseCalendar,
  parseDocumentContent,
  parseDocuments,
  parseGradebook,
  parseSchedule,
  parseStudentInfo,
} from "./parse";
import type { Credentials } from "./types";

/**
 * Browser-side StudentVUE client. The app is a static site (GitHub Pages), so
 * there is no server to proxy SOAP. Instead every request is relayed through a
 * StudentVUE proxy (CORS-enabled) using `ProcessWebServiceRequestMultiWeb`,
 * which works even for districts that block the legacy API directly (UPD5304).
 */

const RELAY =
  process.env.NEXT_PUBLIC_STUDENTVUE_PROXY || "https://studentvuelib.up.railway.app";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
  processEntities: true,
});

export class SvueClientError extends Error {
  kind: string;
  constructor(message: string, kind: string) {
    super(message);
    this.name = "SvueClientError";
    this.kind = kind;
  }
}

function normalizeHost(host: string): string {
  let h = host.trim();
  if (!/^https?:\/\//i.test(h)) h = "https://" + h;
  h = h.replace(/\/+$/, "");
  h = h.replace(/\/Service\/.*$/i, "");
  h = h.replace(/\/PXP2?_Login.*$/i, "");
  return h;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function relayRequest(
  c: Credentials,
  methodName: string,
  paramStr = "<Parms><ChildIntID>0</ChildIntID></Parms>",
): Promise<Record<string, unknown>> {
  const asmx = `${normalizeHost(c.host)}/Service/PXPCommunication.asmx`;
  const envelope =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
    `xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
    `<soap:Body>` +
    `<ProcessWebServiceRequestMultiWeb xmlns="http://edupoint.com/webservices/">` +
    `<userID>${escapeXml(c.username)}</userID>` +
    `<password>${escapeXml(c.password)}</password>` +
    `<skipLoginLog>1</skipLoginLog>` +
    `<parent>0</parent>` +
    `<webServiceHandleName>PXPWebServices</webServiceHandleName>` +
    `<methodName>${methodName}</methodName>` +
    `<paramStr>${escapeXml(paramStr)}</paramStr>` +
    `</ProcessWebServiceRequestMultiWeb>` +
    `</soap:Body></soap:Envelope>`;

  let res: Response;
  try {
    res = await fetch(`${RELAY}/fulfillAxios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: asmx, xml: envelope, encrypted: false }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new SvueClientError(
      "Couldn't reach the StudentVUE relay. Please try again in a moment.",
      "network",
    );
  }
  if (!res.ok) throw new SvueClientError(`Relay error (${res.status}).`, "proxy");

  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    response?: string;
    message?: string;
  } | null;
  if (!json || !json.status || !json.response) {
    throw new SvueClientError(json?.message || "The StudentVUE relay returned an error.", "proxy");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(json.response) as Record<string, unknown>;
  } catch {
    throw new SvueClientError("Unexpected response from the district server.", "parse");
  }
  const env =
    (parsed["soap:Envelope"] as Record<string, unknown>) ??
    (parsed["Envelope"] as Record<string, unknown>);
  const body =
    (env?.["soap:Body"] as Record<string, unknown>) ??
    (env?.["Body"] as Record<string, unknown>);
  const resp = body?.["ProcessWebServiceRequestMultiWebResponse"] as
    | Record<string, unknown>
    | undefined;
  const inner = resp?.["ProcessWebServiceRequestMultiWebResult"];
  if (inner == null) throw new SvueClientError("Unexpected response from the district server.", "parse");

  const trimmed = String(inner).trim();
  if (!trimmed.startsWith("<")) {
    throw new SvueClientError(trimmed || "StudentVUE returned an empty response.", "auth");
  }
  const doc = parser.parse(trimmed) as Record<string, unknown>;
  const errNode = doc["RT_ERROR"] as Record<string, unknown> | undefined;
  if (errNode) {
    const msg = (errNode["@_ERROR_MESSAGE"] as string) || "StudentVUE reported an error.";
    const isAuth = /invalid user|password|login|credential/i.test(msg);
    throw new SvueClientError(isAuth ? "Invalid username or password." : msg, isAuth ? "auth" : "svue");
  }
  return doc;
}

export const svue = {
  studentInfo: (c: Credentials) => relayRequest(c, "StudentInfo").then(parseStudentInfo),
  gradebook: (c: Credentials, reportPeriod?: number) =>
    relayRequest(
      c,
      "Gradebook",
      reportPeriod != null
        ? `<Parms><ChildIntID>0</ChildIntID><ReportPeriod>${reportPeriod}</ReportPeriod></Parms>`
        : undefined,
    ).then(parseGradebook),
  attendance: (c: Credentials) => relayRequest(c, "Attendance").then(parseAttendance),
  schedule: (c: Credentials) => relayRequest(c, "StudentClassList").then(parseSchedule),
  documents: (c: Credentials) =>
    relayRequest(c, "GetStudentDocumentInitialData").then(parseDocuments),
  calendar: (c: Credentials) => relayRequest(c, "StudentCalendar").then(parseCalendar),
  documentContent: (c: Credentials, guid: string) =>
    relayRequest(c, "GetContentOfAttachedDoc", `<Parms><DocumentGU>${guid}</DocumentGU></Parms>`).then(
      parseDocumentContent,
    ),
};
