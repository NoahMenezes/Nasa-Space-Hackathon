import fetch from "node-fetch";

// --- Configuration Change: Using standard Google AI URL and latest production model ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Updated URL for the standard Gemini API endpoint
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
**CRITICAL: This section must contain a complete JSON knowledge graph with nodes and relationships from the experiment.**

Generate a comprehensive knowledge graph with 5-15 nodes representing key entities from the experiment. Use these node types:
- **biological**: genes, proteins, cells, organisms, tissues
- **condition**: experimental conditions, environments, treatments
- **pathway**: biological pathways, processes, mechanisms
- **protein**: specific proteins, enzymes, molecules
- **cell**: cell types, cellular structures
- **environment**: space, microgravity, ISS, lab conditions
- **organism**: species, model organisms
- **gene**: specific genes, genetic elements

**REQUIREMENTS:**
- Include 8-15 nodes minimum
- Create meaningful relationships between nodes
- Use descriptive relationship labels
- Base everything on the actual experiment content
- Include diverse node types from the categories above

\`\`\`json
{
  "nodes": [
    {"id": "microgravity", "label": "Microgravity Environment", "type": "environment"},
    {"id": "protein_crystal", "label": "Protein Crystallization", "type": "biological"},
    {"id": "iss_lab", "label": "ISS Laboratory", "type": "environment"},
    {"id": "crystal_quality", "label": "Crystal Quality", "type": "condition"},
    {"id": "growth_rate", "label": "Growth Rate", "type": "condition"},
    {"id": "molecular_structure", "label": "Molecular Structure", "type": "biological"},
    {"id": "pharmaceutical", "label": "Drug Development", "type": "pathway"},
    {"id": "diffraction_pattern", "label": "X-ray Diffraction", "type": "condition"},
    {"id": "nucleation", "label": "Crystal Nucleation", "type": "pathway"},
    {"id": "convection", "label": "Convection Effects", "type": "condition"}
  ],
  "edges": [
    {"source": "microgravity", "target": "protein_crystal", "relationship": "ENHANCES"},
    {"source": "microgravity", "target": "convection", "relationship": "REDUCES"},
    {"source": "iss_lab", "target": "microgravity", "relationship": "PROVIDES"},
    {"source": "protein_crystal", "target": "crystal_quality", "relationship": "IMPROVES"},
    {"source": "protein_crystal", "target": "molecular_structure", "relationship": "FORMS"},
    {"source": "crystal_quality", "target": "diffraction_pattern", "relationship": "ENHANCES"},
    {"source": "molecular_structure", "target": "pharmaceutical", "relationship": "ENABLES"},
    {"source": "microgravity", "target": "nucleation", "relationship": "AFFECTS"},
    {"source": "nucleation", "target": "growth_rate", "relationship": "CONTROLS"}
  ],
  "summary": "Knowledge graph showing relationships between microgravity conditions, protein crystallization processes, and their impacts on crystal quality and pharmaceutical applications."
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

## FUTURE RESEARCH RECOMMENDATIONS

**MANDATORY SECTION - ALWAYS PROVIDE DETAILED CONTENT**

This section must contain specific, actionable research directions derived from the experiment. Do not leave this section empty or with placeholder text.

### Open Questions
Based on this specific experiment, identify 3-5 critical research questions:
1. What underlying mechanisms explain the observed results?
2. How would different environmental parameters affect outcomes?
3. What are the long-term implications for space exploration?
4. How can these findings be applied to operational space missions?
5. What optimization opportunities exist for future studies?

### Suggested Follow-Up Studies
| Study Type | Focus Area | Priority | Resources Needed |
|------------|------------|----------|------------------|
| Validation | Mechanism confirmation | High | Lab equipment, samples |
| Extension | Parameter optimization | Medium | Extended timeline |
| Application | Practical implementation | High | Field testing resources |

### Research Gaps to Address
- **Mechanistic Understanding**: Detail what biological/physical processes need clarification
- **Scalability**: How findings apply to different scales or environments
- **Long-term Effects**: Investigation of extended duration impacts
- **Practical Applications**: Translation to real-world space missions

### Next Steps Roadmap
1. **Immediate** (0-2 years): Validation studies and mechanism research
2. **Near-term** (2-5 years): Extended parameter studies and optimization
3. **Long-term** (5+ years): Integration into operational space systems

**REQUIREMENT: This section must be completed with experiment-specific content. Generic placeholders are not acceptable. Base all recommendations on the actual experiment data and findings.**

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
      pattern:
        /#{1,3}\s*EXECUTIVE SUMMARY[\s\S]*?(?=#{1,3}\s*EXPERIMENT DETAILS|$)/i,
    },
    {
      key: "experimentDetails",
      pattern:
        /#{1,3}\s*EXPERIMENT DETAILS[\s\S]*?(?=#{1,3}\s*KEY FINDINGS|$)/i,
    },
    {
      key: "keyFindings",
      pattern:
        /#{1,3}\s*KEY FINDINGS[\s\S]*?(?=#{1,3}\s*BIOLOGICAL IMPACTS|$)/i,
    },
    {
      key: "biologicalImpacts",
      pattern:
        /#{1,3}\s*BIOLOGICAL IMPACTS[\s\S]*?(?=#{1,3}\s*KNOWLEDGE GRAPH|$)/i,
    },
    {
      key: "knowledgeGraph",
      pattern:
        /#{1,3}\s*KNOWLEDGE GRAPH[\s\S]*?(?=#{1,3}\s*PRACTICAL APPLICATIONS|$)/i,
    },
    {
      key: "practicalApplications",
      pattern:
        /#{1,3}\s*PRACTICAL APPLICATIONS[\s\S]*?(?=#{1,3}\s*RESEARCH CONNECTIONS|$)/i,
    },
    {
      key: "researchConnections",
      pattern:
        /#{1,3}\s*RESEARCH CONNECTIONS[\s\S]*?(?=#{1,3}\s*FUTURE RESEARCH(?:\s+RECOMMENDATIONS)?|$)/i,
    },
    {
      key: "futureResearch",
      pattern:
        /#{1,3}\s*FUTURE RESEARCH(?:\s+RECOMMENDATIONS)?[\s\S]*?(?=#{1,3}(?!\s*FUTURE)|$)/i,
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
      if (key === "knowledgeGraph") {
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

  // Ensure Future Research section always exists with meaningful content
  if (!sections.futureResearch || sections.futureResearch.trim().length < 50) {
    sections.futureResearch = generateFallbackFutureResearch(analysisText);
  }

  // Ensure Knowledge Graph section has proper structure
  if (
    !sections.knowledgeGraph ||
    typeof sections.knowledgeGraph !== "object" ||
    !sections.knowledgeGraph.nodes
  ) {
    sections.knowledgeGraph = generateFallbackKnowledgeGraph(analysisText);
  }

  return sections;
};

/**
 * Generate fallback Future Research content when AI doesn't produce it
 * @param {string} analysisText - The full analysis text to extract context from
 * @returns {string} Default future research recommendations
 */
const generateFallbackFutureResearch = (analysisText) => {
  // Extract experiment context from the analysis
  const hasSpaceEnvironment = /space|microgravity|zero.?g|ISS|orbital/i.test(
    analysisText,
  );
  const hasBiological =
    /biological|cell|organism|plant|animal|human|tissue/i.test(analysisText);
  const hasMaterial = /material|crystal|protein|chemical|physical/i.test(
    analysisText,
  );

  let content = `### Open Questions
1. What are the underlying mechanisms driving the observed effects in this experiment?
2. How would results vary under different environmental parameters or durations?
3. What are the implications for long-term space missions and crew health?`;

  if (hasSpaceEnvironment) {
    content += `
4. How do these findings translate to other space environments (lunar, Martian)?
5. What countermeasures could be developed based on these results?`;
  }

  content += `

### Suggested Follow-Up Studies
| Study Type | Focus Area | Priority | Resources Needed |
|------------|------------|----------|------------------|
| Validation | Mechanism confirmation | High | Extended experiment duration |
| Parameter | Variable optimization | Medium | Multiple test conditions |`;

  if (hasBiological) {
    content += `
| Biological | Long-term effects | High | Extended timeline, biomarkers |`;
  }

  if (hasMaterial) {
    content += `
| Material | Scale-up testing | Medium | Larger sample sizes |`;
  }

  content += `
| Application | Practical implementation | High | Flight-ready hardware |

### Research Gaps to Address
- **Mechanistic Understanding**: Need deeper investigation into the fundamental processes
- **Duration Effects**: Long-term impacts require extended study periods`;

  if (hasSpaceEnvironment) {
    content += `
- **Environmental Variables**: Effects of different gravitational and radiation conditions`;
  }

  content += `
- **Scalability**: Translation from laboratory to operational space environments
- **Practical Applications**: Development of actionable protocols for space missions

### Next Steps Roadmap
1. **Immediate** (0-2 years): Validation studies with refined experimental parameters
2. **Near-term** (2-5 years): Extended duration studies and mechanism investigation
3. **Long-term** (5+ years): Integration into operational space mission protocols

*Note: This section was generated as fallback content. For more specific recommendations, the experiment analysis should be enhanced with detailed future research planning.*`;

  return content;
};

/**
 * Generate fallback Knowledge Graph when AI doesn't produce proper graph data
 * @param {string} analysisText - The full analysis text to extract context from
 * @returns {Object} Default knowledge graph structure
 */
const generateFallbackKnowledgeGraph = (analysisText) => {
  // Extract key terms and context from the analysis
  const hasSpaceEnvironment = /space|microgravity|zero.?g|ISS|orbital/i.test(
    analysisText,
  );
  const hasBiological =
    /biological|cell|organism|plant|animal|human|tissue|protein|gene/i.test(
      analysisText,
    );
  const hasMaterial = /material|crystal|chemical|physical|structure/i.test(
    analysisText,
  );
  const hasExperiment = /experiment|study|research|test|analysis/i.test(
    analysisText,
  );

  const nodes = [];
  const edges = [];
  let nodeId = 1;

  // Core experiment node
  nodes.push({
    id: `node_${nodeId++}`,
    label: "Experiment",
    type: "condition",
  });

  // Add space-related nodes
  if (hasSpaceEnvironment) {
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Microgravity",
      type: "environment",
    });
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Space Environment",
      type: "environment",
    });

    // Create relationships
    edges.push({
      source: "node_2",
      target: "node_1",
      relationship: "AFFECTS",
    });
    edges.push({
      source: "node_3",
      target: "node_2",
      relationship: "PROVIDES",
    });
  }

  // Add biological nodes
  if (hasBiological) {
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Biological System",
      type: "biological",
    });
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Cellular Response",
      type: "cell",
    });

    edges.push({
      source: "node_1",
      target: `node_${nodeId - 2}`,
      relationship: "STUDIES",
    });
    edges.push({
      source: `node_${nodeId - 2}`,
      target: `node_${nodeId - 1}`,
      relationship: "PRODUCES",
    });
  }

  // Add material science nodes
  if (hasMaterial) {
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Material Properties",
      type: "condition",
    });
    nodes.push({
      id: `node_${nodeId++}`,
      label: "Structural Changes",
      type: "pathway",
    });

    edges.push({
      source: "node_1",
      target: `node_${nodeId - 2}`,
      relationship: "MEASURES",
    });
    edges.push({
      source: `node_${nodeId - 2}`,
      target: `node_${nodeId - 1}`,
      relationship: "CAUSES",
    });
  }

  // Add research outcome nodes
  nodes.push({
    id: `node_${nodeId++}`,
    label: "Research Findings",
    type: "condition",
  });
  nodes.push({
    id: `node_${nodeId++}`,
    label: "Future Applications",
    type: "pathway",
  });

  edges.push({
    source: "node_1",
    target: `node_${nodeId - 2}`,
    relationship: "GENERATES",
  });
  edges.push({
    source: `node_${nodeId - 2}`,
    target: `node_${nodeId - 1}`,
    relationship: "ENABLES",
  });

  return {
    nodes: nodes,
    edges: edges,
    summary:
      "Generated knowledge graph showing key relationships and concepts from the experiment analysis. This fallback graph provides a basic structure when detailed graph data is not available from the AI analysis.",
  };
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

// Export parsing functions for testing
export {
  parseAnalysisSections,
  generateFallbackFutureResearch,
  generateFallbackKnowledgeGraph,
};
