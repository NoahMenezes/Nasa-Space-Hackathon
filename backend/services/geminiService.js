import fetch from "node-fetch";

// --- Configuration Change: Using standard Google AI URL and latest production model ---
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ;
// Updated URL for the standard Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Analyze a NASA experiment publication using Gemini API
 * @param {string} experimentLink - URL of the experiment publication
 * @param {string} experimentTitle - Title of the experiment
 * @param {string} experimentAuthors - Authors of the experiment
 * @returns {Promise<Object>} Analysis results including summary, knowledge graph, and insights
 */
export const analyzeExperiment = async (
  experimentLink,
  experimentTitle,
  experimentAuthors,
) => {
  try {
    const prompt = `You are an expert NASA bioscience research analyst. Analyze the following NASA bioscience experiment publication and provide a comprehensive, well-structured analysis.

**Experiment Title:** ${experimentTitle}

**Authors:** ${experimentAuthors}

**Publication Link:** ${experimentLink}

Please provide a detailed analysis in the following structured format using markdown with tables, bullet points, and clear organization. **You MUST include all the main section headings exactly as listed below, even if you leave the content of a section blank.**

## EXECUTIVE SUMMARY
Provide 2-3 comprehensive paragraphs covering:
- **Overview**: What was studied and why it matters
- **Key Findings**: Most significant results and discoveries
- **Impact**: Implications for space bioscience and human spaceflight

Use bold text for emphasis on critical findings.

---

## EXPERIMENT DETAILS
Organize with clear subsections:

### Research Question & Hypothesis
- Primary research question
- Main hypothesis tested

### Methodology
- Experimental design approach
- Key techniques and equipment used
- Sample preparation methods

### Test Subjects & Conditions
Create a table format:
| Aspect | Details |
|--------|---------|
| Subjects/Samples | Type and quantity |
| Environment | Microgravity/radiation conditions |
| Duration | Experiment timeline |
| Controls | Control groups used |

### Timeline
- Mission/experiment duration
- Key milestones

---

## KEY FINDINGS
Present as a numbered list with detailed explanations for 5-7 major findings. Each entry must start with a descriptive title in bold.

1. **[Descriptive Finding Title]**: Description of the finding with specific data points where applicable, including statistical significance (p-values, confidence levels) if known.
2. **[Descriptive Finding Title]**: Description of the finding.
3. **[Descriptive Finding Title]**: Description of the finding.
4. **[Descriptive Finding Title]**: Description of the finding.
5. **[Descriptive Finding Title]**: Description of the finding.
(Continue up to 7, if applicable)

Highlight novel discoveries or unexpected results with blockquotes:
> Notable Discovery: [Description]

---

## BIOLOGICAL IMPACTS

### Cellular Level Effects
- Gene expression changes
- Protein synthesis alterations
- Cell signaling modifications

### Physiological Changes
Present in table format:
| System | Observed Change | Significance |
|--------|----------------|--------------|
| [System] | [Change] | [Impact] |

### Molecular & Genetic Implications
- DNA/RNA modifications
- Epigenetic changes
- Metabolic pathway effects

### Astronaut Health Implications
- Short-term effects
- Long-term health concerns
- Countermeasure recommendations

---

## KNOWLEDGE GRAPH
**You must output the content for this section as a single JSON code block.** Do NOT use markdown outside of the JSON block. This data will be used to generate a graph.

\`\`\`json
{
  "nodes": [
    {"id": "gene_x", "label": "Gene X (FOXP2)", "type": "Gene"},
    {"id": "microg", "label": "Microgravity", "type": "Condition"},
    {"id": "iss", "label": "ISS (Habitat)", "type": "Location"}
  ],
  "edges": [
    {"source": "microg", "target": "gene_x", "relationship": "CAUSES_UPREGULATION"},
    {"source": "gene_x", "target": "iss", "relationship": "OBSERVED_IN"}
  ],
  "summary": "Brief textual summary of the relationships extracted."
}
\`\`\`

---

## PRACTICAL APPLICATIONS

### Space Exploration Applications
1. **Long-Duration Spaceflight**
   - Specific implications
   - Risk mitigation strategies

2. **Mars Mission Relevance**
   - How findings apply to Mars missions
   - Countermeasure development

### Earth-Based Medical Applications
- Clinical applications
- Drug development opportunities
- Diagnostic tool potential

### Technology Development
- New monitoring systems
- Protective equipment
- Treatment protocols

---

## RESEARCH CONNECTIONS

### Related NASA Missions
| Mission/Experiment | Connection | Year |
|--------------------|------------|------|
| [Name] | [How it relates] | [Year] |

### Interdisciplinary Links
- **Medicine**: [Specific connection]
- **Engineering**: [Specific connection]
- **Physics**: [Specific connection]
- **Biology**: [Specific connection]

### Research Timeline
- Previous studies that led here
- Current position in research arc
- Future directions indicated

---

## VISUAL INSIGHTS

Suggest **5 specific, different visualizations** (Graphs & Charts) with details. Each entry must be uniquely numbered 1 through 5.

1. **Chart 1 Name** - Description of what this chart shows.
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

2. **Chart 2 Name** - Description of what this chart shows.
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

3. **Chart 3 Name** - Description of what this chart shows.
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

4. **Chart 4 Name** - Description of what this chart shows.
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

5. **Chart 5 Name** - Description of what this chart shows.
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

---

## FUTURE RESEARCH RECOMMENDATIONS

### Open Questions
1. [Specific question requiring further investigation]
2. [Specific question about mechanisms]
3. Continue for key unknowns...

### Suggested Follow-Up Studies
| Study Type | Focus Area | Priority | Resources Needed |
|------------|------------|----------|------------------|
| [Type] | [Area] | High/Medium/Low | [Resources] |

### Research Gaps to Address
- **Gap 1**: [Description and why it matters]
- **Gap 2**: [Description and potential impact]
- **Gap 3**: [Description and connection to broader goals]

### Next Steps Roadmap
1. **Immediate** (0-2 years): [Studies]
2. **Near-term** (2-5 years): [Studies]
3. **Long-term** (5+ years): [Studies]

---

**Format Guidelines:**
- Use markdown tables where data comparison is needed
- Use bold (**) for emphasis on critical points
- Use bullet points and numbered lists for clarity
- Structure information hierarchically for easy scanning
- Add horizontal rules (---) between major sections for visual scanning **BUT DO NOT USE horizontal rules within the section content.**
- **You MUST use the exact main section headings provided (e.g., '## EXECUTIVE SUMMARY') and you MUST ensure some content or a placeholder is present for every section.**`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        // Increased temperature slightly to encourage creative content for all sections
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }

    const analysisText = data.candidates[0].content.parts[0].text;

    // Extract structured information from the response
    const result = {
      success: true,
      experimentTitle,
      experimentAuthors,
      experimentLink,
      analysis: analysisText,
      sections: parseAnalysisSections(analysisText),
      generatedAt: new Date().toISOString(),
      model: "gemini-2.5-flash", 
    };

    return result;
  } catch (error) {
    console.error("Error analyzing experiment with Gemini:", error);
    throw {
      success: false,
      error: error.message,
      details: "Failed to analyze experiment with Gemini API",
    };
  }
};

/**
 * Parse the analysis text into structured sections
 * @param {string} analysisText - Raw analysis text from Gemini
 * @returns {Object} Structured sections
 */
const parseAnalysisSections = (analysisText) => {
  const sections = {};

  // Define section patterns - NOTE: Using lookahead assertions for reliable splitting
  const sectionPatterns = [
    {
      key: "executiveSummary",
      pattern: /#{1,3}\s*EXECUTIVE SUMMARY[\s\S]*?(?=#{1,3}\s*EXPERIMENT DETAILS|$)/i,
    },
    {
      key: "experimentDetails",
      pattern: /#{1,3}\s*EXPERIMENT DETAILS[\s\S]*?(?=#{1,3}\s*KEY FINDINGS|$)/i,
    },
    {
      key: "keyFindings",
      pattern: /#{1,3}\s*KEY FINDINGS[\s\S]*?(?=#{1,3}\s*BIOLOGICAL IMPACTS|$)/i,
    },
    {
      key: "biologicalImpacts",
      pattern: /#{1,3}\s*BIOLOGICAL IMPACTS[\s\S]*?(?=#{1,3}\s*KNOWLEDGE GRAPH|$)/i,
    },
    {
      key: "knowledgeGraph",
      pattern: /#{1,3}\s*KNOWLEDGE GRAPH[\s\S]*?(?=#{1,3}\s*PRACTICAL APPLICATIONS|$)/i,
    },
    {
      key: "practicalApplications",
      pattern: /#{1,3}\s*PRACTICAL APPLICATIONS[\s\S]*?(?=#{1,3}\s*RESEARCH CONNECTIONS|$)/i,
    },
    {
      key: "researchConnections",
      pattern: /#{1,3}\s*RESEARCH CONNECTIONS[\s\S]*?(?=#{1,3}\s*VISUAL INSIGHTS|$)/i,
    },
    {
      key: "visualInsights",
      pattern: /#{1,3}\s*VISUAL INSIGHTS[\s\S]*?(?=#{1,3}\s*FUTURE RESEARCH(?:\s+RECOMMENDATIONS)?|$)/i,
    },
    {
      key: "futureResearch",
      pattern:
        /#{1,3}\s*FUTURE RESEARCH(?:\s+RECOMMENDATIONS)?[\s\S]*?(?=#{1,3}|$)/i,
    },
  ];

  sectionPatterns.forEach(({ key, pattern }) => {
    const match = analysisText.match(pattern);
    if (match) {
      // Regex to remove the main header and optional trailing '---'
      let content = match[0]
        .replace(
          /#{1,3}\s*(EXECUTIVE SUMMARY|EXPERIMENT DETAILS|KEY FINDINGS|BIOLOGICAL IMPACTS|KNOWLEDGE GRAPH|PRACTICAL APPLICATIONS|RESEARCH CONNECTIONS|VISUAL INSIGHTS|FUTURE RESEARCH(?:\s+RECOMMENDATIONS)?)/i,
          "",
        )
        .trim();
      
      content = content.replace(/---\s*$/, "").trim();
      
      // *** NEW LOGIC FOR KNOWLEDGE GRAPH JSON EXTRACTION ***
      if (key === 'knowledgeGraph') {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
          if (jsonMatch && jsonMatch[1]) {
              try {
                  // If we successfully extract and parse JSON, store the parsed object
                  sections[key] = JSON.parse(jsonMatch[1]);
              } catch (e) {
                  // If parsing fails, fall back to storing the raw JSON/content block
                  sections[key] = content;
                  console.warn("Failed to parse Knowledge Graph JSON:", e.message);
              }
          } else {
              // If JSON block is not found, store the raw content (which is expected to be empty or markdown)
              sections[key] = content;
          }
      } else {
          sections[key] = content;
      }
    }
  });

  // Fallback for full analysis if splitting fails completely
  if (Object.keys(sections).length < 2) {
    sections.fullAnalysis = analysisText;
  }

  return sections;
};

/**
 * Generate a quick summary for search results
 * @param {string} experimentTitle - Title of the experiment
 * @param {string} experimentAuthors - Authors of the experiment
 * @returns {Promise<Object>} Quick summary
 */
export const generateQuickSummary = async (
  experimentTitle,
  experimentAuthors,
) => {
  try {
    const prompt = `Provide a concise 2-3 sentence summary of this NASA bioscience experiment:

Title: ${experimentTitle}
Authors: ${experimentAuthors}

Focus on: What was studied, why it matters for space exploration, and the general research area.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 200,
      },
    };

    // Use the standard URL for the quick summary as well
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return {
      success: true,
      summary: summary.trim(),
    };
  } catch (error) {
    console.error("Error generating quick summary:", error);
    return {
      success: false,
      summary: "Summary generation failed",
    };
  }
};