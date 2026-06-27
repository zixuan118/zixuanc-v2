import { NextResponse } from "next/server"
import OpenAI from "openai"
import type {
  RelationshipDiscoveryRequest,
  RelationshipSuggestionsResponse,
} from "@/lib/data-studio/second-reading"

const systemInstruction = `You review computed relationship candidates for a tabular dataset.

You receive only structured metadata and pre-computed summaries. Never raw rows.

You do NOT compute statistics. You do NOT claim causality or statistical significance.
You rank and explain relationships using field names plus the supplied computed evidence.

Use plain, practical language. These suggestions do not prove cause and effect.
Use correct grammar (for example, "a useful descriptive insight", not "an useful").

Return JSON only. Be cautious. Prefer "do-not-claim" when confounding is likely.`

function fixRelationshipCopy(text: string): string {
  return text.replace(/\ban useful\b/gi, "a useful").trim()
}

function normalizeResponse(raw: unknown): RelationshipSuggestionsResponse | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const suggestions = Array.isArray(r.relationshipSuggestions)
    ? r.relationshipSuggestions
        .filter((s) => s && typeof s === "object")
        .slice(0, 8)
        .map((s) => {
          const o = s as Record<string, unknown>
          return {
            title: String(o.title ?? "Relationship"),
            variables: Array.isArray(o.variables)
              ? o.variables.map(String)
              : [],
            relationshipType: o.relationshipType as RelationshipSuggestionsResponse["relationshipSuggestions"][0]["relationshipType"],
            status: (["worth-reviewing", "weak", "do-not-claim"].includes(
              String(o.status),
            )
              ? o.status
              : "weak") as RelationshipSuggestionsResponse["relationshipSuggestions"][0]["status"],
            plainEnglishReason: fixRelationshipCopy(String(o.plainEnglishReason ?? "")),
            supportingComputedEvidence: Array.isArray(o.supportingComputedEvidence)
              ? o.supportingComputedEvidence.map(String)
              : [],
            cautions: Array.isArray(o.cautions) ? o.cautions.map(String) : [],
            shouldVisualize: Boolean(o.shouldVisualize),
          }
        })
    : []

  return {
    relationshipSuggestions: suggestions,
    notSafeToClaim: Array.isArray(r.notSafeToClaim)
      ? r.notSafeToClaim.map(String).slice(0, 5)
      : [],
    recommendedNextChecks: Array.isArray(r.recommendedNextChecks)
      ? r.recommendedNextChecks.map(String).slice(0, 4)
      : [],
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { ok: false, message: "Missing OPENAI_API_KEY" },
      { status: 500 },
    )
  }

  let body: RelationshipDiscoveryRequest
  try {
    body = (await request.json()) as RelationshipDiscoveryRequest
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request payload." },
      { status: 400 },
    )
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemInstruction }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Computed relationship candidates and metadata:\n${JSON.stringify(body, null, 2)}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "relationship_suggestions",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "relationshipSuggestions",
              "notSafeToClaim",
              "recommendedNextChecks",
            ],
            properties: {
              relationshipSuggestions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "title",
                    "variables",
                    "relationshipType",
                    "status",
                    "plainEnglishReason",
                    "supportingComputedEvidence",
                    "cautions",
                    "shouldVisualize",
                  ],
                  properties: {
                    title: { type: "string" },
                    variables: { type: "array", items: { type: "string" } },
                    relationshipType: {
                      type: "string",
                      enum: [
                        "correlation",
                        "group-difference",
                        "trend",
                        "funnel",
                        "quality-risk",
                        "possible-confounder",
                      ],
                    },
                    status: {
                      type: "string",
                      enum: ["worth-reviewing", "weak", "do-not-claim"],
                    },
                    plainEnglishReason: { type: "string" },
                    supportingComputedEvidence: {
                      type: "array",
                      items: { type: "string" },
                    },
                    cautions: { type: "array", items: { type: "string" } },
                    shouldVisualize: { type: "boolean" },
                  },
                },
              },
              notSafeToClaim: { type: "array", items: { type: "string" } },
              recommendedNextChecks: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    })

    const rawText = response.output_text ?? ""
    const parsed = rawText ? JSON.parse(rawText) : null
    const normalized = normalizeResponse(parsed)
    if (!normalized) {
      return NextResponse.json(
        { ok: false, message: "Malformed model response." },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, data: normalized })
  } catch (error) {
    console.error("Relationship discovery error:", error)
    return Response.json(
      { ok: false, message: "Relationship suggestions unavailable" },
      { status: 500 },
    )
  }
}
