import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDjxUzJ6sod7d9QvOoJ8WcQn4r9YF5Iyws';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Analyze a NASA experiment publication using Gemini API
 * @param {string} experimentLink - URL of the experiment publication
 * @param {string} experimentTitle - Title of the experiment
 * @param {string} experimentAuthors - Authors of the experiment
 * @returns {Promise<Object>} Analysis results including summary, knowledge graph, and insights
 */
export const analyzeExperiment = async (experimentLink, experimentTitle, experimentAuthors) => {
  try {
    const prompt = `You are an expert NASA bioscience research analyst. Analyze the following NASA bioscience experiment publication and provide a comprehensive analysis.

**Experiment Title:** ${experimentTitle}

**Authors:** ${experimentAuthors}

**Publication Link:** ${experimentLink}

Please provide a detailed analysis in the following structured format:

1. **EXECUTIVE SUMMARY** (2-3 paragraphs):
   - Overview of the experiment and its significance
   - Key findings and results
   - Impact on space bioscience research

2. **EXPERIMENT DETAILS**:
   - Research question and hypothesis
   - Methodology and experimental design
   - Subjects/samples used
   - Environmental conditions (microgravity, radiation, etc.)
   - Duration and timeline

3. **KEY FINDINGS**:
   - List 5-7 major findings with brief explanations
   - Statistical significance where applicable
   - Novel discoveries or unexpected results

4. **BIOLOGICAL IMPACTS**:
   - Effects on cellular level
   - Physiological changes observed
   - Molecular and genetic implications
   - Health implications for astronauts

5. **KNOWLEDGE GRAPH** (structured relationships):
   Present as a JSON-like structure showing:
   - Primary research areas → Sub-topics
   - Biological systems affected → Specific effects
   - Experimental conditions → Observed outcomes
   - Related research areas and connections

6. **PRACTICAL APPLICATIONS**:
   - Implications for long-duration spaceflight
   - Medical applications on Earth
   - Future research directions
   - Technology or countermeasure development

7. **RESEARCH CONNECTIONS**:
   - Related NASA missions or experiments
   - Connected research domains
   - Interdisciplinary links

8. **VISUAL INSIGHTS**:
   - Suggest 3-5 key visualizations that would help understand the data
   - Types of graphs or charts that would be most informative

9. **FUTURE RESEARCH RECOMMENDATIONS**:
   - Open questions
   - Suggested follow-up studies
   - Research gaps to address

Please format your response in a clear, structured manner using markdown. Use headers, bullet points, and emphasis where appropriate to make the information easily digestible.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
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
      model: 'gemini-2.0-flash-exp'
    };

    return result;

  } catch (error) {
    console.error('Error analyzing experiment with Gemini:', error);
    throw {
      success: false,
      error: error.message,
      details: 'Failed to analyze experiment with Gemini API'
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
    { key: 'executiveSummary', pattern: /#{1,3}\s*EXECUTIVE SUMMARY[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'experimentDetails', pattern: /#{1,3}\s*EXPERIMENT DETAILS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'keyFindings', pattern: /#{1,3}\s*KEY FINDINGS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'biologicalImpacts', pattern: /#{1,3}\s*BIOLOGICAL IMPACTS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'knowledgeGraph', pattern: /#{1,3}\s*KNOWLEDGE GRAPH[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'practicalApplications', pattern: /#{1,3}\s*PRACTICAL APPLICATIONS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'researchConnections', pattern: /#{1,3}\s*RESEARCH CONNECTIONS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'visualInsights', pattern: /#{1,3}\s*VISUAL INSIGHTS[\s\S]*?(?=#{1,3}|$)/i },
    { key: 'futureResearch', pattern: /#{1,3}\s*FUTURE RESEARCH[\s\S]*?(?=#{1,3}|$)/i }
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
export const generateQuickSummary = async (experimentTitle, experimentAuthors) => {
  try {
    const prompt = `Provide a concise 2-3 sentence summary of this NASA bioscience experiment:

Title: ${experimentTitle}
Authors: ${experimentAuthors}

Focus on: What was studied, why it matters for space exploration, and the general research area.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return {
      success: true,
      summary: summary.trim()
    };

  } catch (error) {
    console.error('Error generating quick summary:', error);
    return {
      success: false,
      summary: 'Summary generation failed'
    };
  }
};
