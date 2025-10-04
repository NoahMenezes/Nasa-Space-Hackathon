import fetch from "node-fetch";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

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

Please provide a detailed analysis in the following structured format using markdown with tables, bullet points, and clear organization:

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
Present as numbered list with detailed explanations:

1. **[Finding Title]**: Description of the finding with specific data points where applicable
2. **[Finding Title]**: Include statistical significance (p-values, confidence levels)
3. Continue for 5-7 major findings...

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
Create a structured visual representation using indentation and arrows:

**Primary Research Areas**
- Space Biology
  → Microgravity Effects
    → Cellular Adaptation
    → Physiological Changes
  → Radiation Biology
    → DNA Damage
    → Repair Mechanisms

**Biological Systems Affected**
- [System 1] → [Specific Effect 1] → [Outcome]
- [System 2] → [Specific Effect 2] → [Outcome]

**Experimental Conditions → Outcomes**
- Microgravity → [Key Observation] → [Resulting Change]
- Radiation Exposure → [Key Observation] → [Resulting Change]

**Related Research Connections**
- Connection to: [Related Field 1]
- Connection to: [Related Field 2]

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

Suggest specific visualizations with details:

### Recommended Graphs & Charts

1. **[Chart Type]** - [What it shows]
   - X-axis: [Variable]
   - Y-axis: [Variable]
   - Key comparison: [What to highlight]

2. **Heat Map** - [Specific data to visualize]
   - Shows: [Relationships/patterns]
   - Useful for: [Understanding what]

3. **Timeline/Gantt Chart** - Experiment progression
   - Phases and key events
   - Data collection points

4. **Network Diagram** - Biological pathway connections
   - Shows: [Relationships]
   - Highlights: [Key interactions]

5. **Comparison Bar/Line Chart** - [Specific comparison]
   - Control vs. experimental groups
   - Key metrics tracked

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
- Include specific data points and measurements where applicable
- Structure information hierarchically for easy scanning
- Add horizontal rules (---) between major sections for visual separation`;

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
        temperature: 0.7,
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

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      model: "gemini-2.0-flash-exp",
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

  // Define section patterns
  const sectionPatterns = [
    {
      key: "executiveSummary",
      pattern: /#{1,3}\s*EXECUTIVE SUMMARY[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "experimentDetails",
      pattern: /#{1,3}\s*EXPERIMENT DETAILS[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "keyFindings",
      pattern: /#{1,3}\s*KEY FINDINGS[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "biologicalImpacts",
      pattern: /#{1,3}\s*BIOLOGICAL IMPACTS[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "knowledgeGraph",
      pattern: /#{1,3}\s*KNOWLEDGE GRAPH[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "practicalApplications",
      pattern: /#{1,3}\s*PRACTICAL APPLICATIONS[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "researchConnections",
      pattern: /#{1,3}\s*RESEARCH CONNECTIONS[\s\S]*?(?=#{1,3}|$)/i,
    },
    {
      key: "visualInsights",
      pattern: /#{1,3}\s*VISUAL INSIGHTS[\s\S]*?(?=#{1,3}|$)/i,
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
      sections[key] = match[0].trim();
    }
  });

  // If no sections found, return the full text as summary
  if (Object.keys(sections).length === 0) {
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

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

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
