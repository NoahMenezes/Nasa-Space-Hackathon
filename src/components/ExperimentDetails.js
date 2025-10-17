import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./ExperimentDetails.css";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "../utils/bookmarksUtils";
import { supabase } from "../lib/supabase.js";

// --- START: KnowledgeGraph Component (Self-Contained for integration) ---
// 💡 IMPORTANT: You must install the dependency: npm install react-force-graph-2d
import ForceGraph2D from "react-force-graph-2d";

const KnowledgeGraph = ({ graphData }) => {
  const [showLegend, setShowLegend] = useState(true);

  const isEmpty =
    !graphData || !graphData.nodes || graphData.nodes.length === 0;

  // Enhanced container style with improved visual design
  const containerStyle = {
    height: "600px", // Increased height for better visibility
    width: "100%",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", // Gradient background
    borderRadius: "1rem",
    overflow: "hidden",
    border: "2px solid rgba(103, 232, 249, 0.3)",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(103, 232, 249, 0.1)",
    position: "relative",
  };

  const placeholderStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#94a3b8",
    fontSize: "1.2rem",
    textAlign: "center",
    padding: "3rem",
    gap: "1rem",
  };

  // Enhanced node color scheme
  const getNodeColor = (node) => {
    const colorMap = {
      biological: "#10b981", // Emerald green
      condition: "#3b82f6", // Blue
      gene: "#8b5cf6", // Purple
      protein: "#f59e0b", // Amber
      pathway: "#ef4444", // Red
      cell: "#06b6d4", // Cyan
      organism: "#84cc16", // Lime
      environment: "#f97316", // Orange
      default: "#64748b", // Slate
    };

    const nodeType = node.type?.toLowerCase() || "default";
    return colorMap[nodeType] || colorMap.default;
  };

  return (
    <div className="knowledge-graph-container" style={containerStyle}>
      {/* Interactive Controls */}
      {!isEmpty && (
        <div className="knowledge-graph-controls">
          <button
            className="graph-control-btn"
            onClick={() => setShowLegend(!showLegend)}
            title="Toggle Legend"
          >
            {showLegend ? "Hide Legend" : "Show Legend"}
          </button>
          <button
            className="graph-control-btn"
            onClick={() => {
              // Reset node positions
              if (graphData?.nodes) {
                graphData.nodes.forEach((node) => {
                  delete node.fx;
                  delete node.fy;
                });
              }
            }}
            title="Reset Layout"
          >
            Reset
          </button>
        </div>
      )}

      {/* Knowledge Graph Header */}
      {!isEmpty && (
        <div className="knowledge-graph-header">
          <h3 className="knowledge-graph-title">🕸️ Knowledge Graph</h3>
          <p className="knowledge-graph-subtitle">
            Interactive visualization of experiment relationships and concepts
          </p>
        </div>
      )}

      {isEmpty ? (
        <div style={placeholderStyle}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕸️</div>
          <div>No structured data available to generate a knowledge graph.</div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#64748b",
              marginTop: "0.5rem",
            }}
          >
            The AI analysis may not have generated graph data for this
            experiment.
          </div>
        </div>
      ) : (
        <ForceGraph2D
          graphData={{
            nodes: graphData.nodes,
            links: graphData.edges.map((e) => ({
              source: e.source,
              target: e.target,
              label: e.relationship || "",
              type: e.type || "default",
            })),
          }}
          // Enhanced visual settings
          backgroundColor="transparent"
          nodeLabel={(node) =>
            `${node.label}${node.type ? ` (${node.type})` : ""}`
          }
          linkLabel="label"
          // Enhanced directional indicators with white color
          linkDirectionalParticles={2}
          linkDirectionalParticleColor={() => "#ffffff"}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          // White arrows for better contrast
          linkDirectionalArrowLength={10}
          linkDirectionalArrowRelPos={0.9}
          linkDirectionalArrowColor={() => "#ffffff"}
          // Link styling
          linkColor={() => "rgba(255, 255, 255, 0.6)"}
          linkWidth={2}
          linkHoverColor={() => "#67e8f9"}
          // Node interactions
          linkHoverDuringDrag={false}
          nodeRelSize={10}
          // Enhanced node rendering
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = Math.max(10, 14 / globalScale);
            const nodeRadius = Math.max(8, 12 / globalScale);

            ctx.font = `${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const color = getNodeColor(node);

            // Enhanced node with double ring effect
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fill();

            // Main node
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Node border
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Enhanced label with background
            const labelY = node.y - nodeRadius - 8;
            const textMetrics = ctx.measureText(label);
            const textWidth = textMetrics.width;
            const padding = 6;

            // Label background
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.fillRect(
              node.x - textWidth / 2 - padding,
              labelY - fontSize / 2 - padding / 2,
              textWidth + padding * 2,
              fontSize + padding,
            );

            // Label border
            ctx.strokeStyle = "rgba(103, 232, 249, 0.3)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              node.x - textWidth / 2 - padding,
              labelY - fontSize / 2 - padding / 2,
              textWidth + padding * 2,
              fontSize + padding,
            );

            // Label text
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.fillText(label, node.x, labelY);
          }}
          // Enhanced link label rendering
          linkCanvasObject={(link, ctx, globalScale) => {
            const label = link.label;
            const start = link.source;
            const end = link.target;

            if (typeof start !== "object" || typeof end !== "object" || !label)
              return;

            const textPos = {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2,
            };

            const fontSize = Math.max(8, 10 / globalScale);
            ctx.font = `${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Enhanced label background
            const textMetrics = ctx.measureText(label);
            const textWidth = textMetrics.width;
            const padding = 4;

            ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
            ctx.fillRect(
              textPos.x - textWidth / 2 - padding,
              textPos.y - fontSize / 2 - padding / 2,
              textWidth + padding * 2,
              fontSize + padding,
            );

            // Label border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              textPos.x - textWidth / 2 - padding,
              textPos.y - fontSize / 2 - padding / 2,
              textWidth + padding * 2,
              fontSize + padding,
            );

            // Enhanced label text
            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, textPos.x, textPos.y);
          }}
          // Enhanced node interactions
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
          onNodeHover={(node) => {
            document.body.style.cursor = node ? "pointer" : "default";
          }}
          // Enhanced physics simulation
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={100}
          cooldownTicks={200}
        />
      )}

      {/* Enhanced Legend */}
      {!isEmpty && showLegend && (
        <div className="knowledge-graph-legend">
          <div className="legend-title">Node Types</div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <span>Biological</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#3b82f6" }}
            ></div>
            <span>Condition</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#8b5cf6" }}
            ></div>
            <span>Gene</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#f59e0b" }}
            ></div>
            <span>Protein</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ef4444" }}
            ></div>
            <span>Pathway</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#06b6d4" }}
            ></div>
            <span>Cell</span>
          </div>
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            • White arrows show relationships
            <br />
            • Drag nodes to rearrange
            <br />• Hover for details
          </div>
        </div>
      )}
    </div>
  );
};
// --- END: KnowledgeGraph Component ---

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [experiment, setExperiment] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [bookmarked, setBookmarked] = useState(false);
  // Initial list of all potential sections for navigation, regardless of content
  const initialSections = [
    "executiveSummary",
    "experimentDetails",
    "keyFindings",
    "biologicalImpacts",
    "knowledgeGraph",
    "practicalApplications",
    "researchConnections",
    "futureResearch",
  ];
  const [availableSections, setAvailableSections] = useState(initialSections);

   const getBackendBase = () =>
    (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

  useEffect(() => {
    const controller = new AbortController();
    let progressInterval = null;

    const fetchExperiment = async () => {
      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);

      // Simulate loading progress
     progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return Math.min(90, prev + Math.random() * 15);
        });
      }, 200);

      try {
       const backend = getBackendBase();
        const url = `${backend}/api/experiments/${encodeURIComponent(id)}`;

        // attach supabase token if available
        const sessionResp = await supabase.auth.getSession().catch(() => ({}));
        const token = sessionResp?.data?.session?.access_token;
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const resp = await fetch(url, {
          method: "GET",
          headers,
          signal: controller.signal,
          // mode: "cors" // default is fine; add if needed
        });

        if (!resp.ok) {
          // attempt to read message from body
          let serverMessage = `Failed to fetch experiment (status ${resp.status})`;
          try {
            const body = await resp.json();
            serverMessage = body?.message || body?.error || serverMessage;
          } catch (e) {
            // ignore JSON parse error
          }
          throw new Error(serverMessage);
        }

        const data = await resp.json();
        setExperiment(data.experiment || data || null);
        setLoadingProgress(100);

       // trigger analysis (fire-and-await) with its own abort controller
        await analyzeExperimentAuto(data.experiment);
      } catch (err) {
        if (err.name === "AbortError") {
          console.info("Experiment fetch aborted");
        } else {
          console.error("Error fetching experiment:", err);
          setError(err.message || "NetworkError when attempting to fetch resource.");
        }
      } finally {
        if (progressInterval) clearInterval(progressInterval);
        setIsLoading(false);
      }
    };

   if (id) fetchExperiment();

    return () => {
      controller.abort();
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [id]);

  const analyzeExperimentAuto = async (experimentData) => {
    setIsAnalyzing(true);
    setError(null);
    const controller = new AbortController();


    try {
      const backend = getBackendBase();
      const url = `${backend}/api/experiments/${encodeURIComponent(
        experimentData.id || experimentData?.experiment_id || id,
      )}/analyze`;

      // attach supabase token if available
      const sessionResp = await supabase.auth.getSession().catch(() => ({}));
      const token = sessionResp?.data?.session?.access_token;
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch(url, {
        method: "POST",
        headers,
        signal: controller.signal,
      });

      if (!resp.ok) {
        let serverMessage = `Failed to analyze experiment (status ${resp.status})`;
        try {
          const body = await resp.json();
          serverMessage = body?.message || body?.error || serverMessage;
        } catch (e) {}
        throw new Error(serverMessage);
      }

      const data = await resp.json();
      setAnalysis(data.analysis || data || null);

      if (data.analysis?.sections) {
        setAvailableSections(Object.keys(data.analysis.sections));
      } else {
        setAvailableSections(initialSections);
      }
    } catch (err) {
     if (err.name === "AbortError") {
        console.info("Analyze request aborted");
      } else {
        console.error("Error analyzing experiment:", err);
        setError(err.message || "Failed to analyze experiment");
        setAvailableSections(initialSections);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };


  useEffect(() => {
    if (experiment) {
      setBookmarked(isBookmarked(experiment.id));
    }
  }, [experiment]);

  // Duplicated analyzeExperiment function, applying the same logic for consistency
  const analyzeExperiment = async () => {
     setIsAnalyzing(true);
    setError(null);
    const controller = new AbortController();

    try {
      const backend = getBackendBase();
      const url = `${backend}/api/experiments/${encodeURIComponent(id)}/analyze`;

      const sessionResp = await supabase.auth.getSession().catch(() => ({}));
      const token = sessionResp?.data?.session?.access_token;
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch(url, {
        method: "POST",
        headers,
        signal: controller.signal,
      });

      if (!resp.ok) {
        let serverMessage = `Failed to analyze experiment (status ${resp.status})`;
        try {
          const body = await resp.json();
          serverMessage = body?.message || body?.error || serverMessage;
        } catch (e) {}
        throw new Error(serverMessage);
      }

      const data = await resp.json();
      setAnalysis(data.analysis || data || null);

      if (data.analysis?.sections) {
        setAvailableSections(Object.keys(data.analysis.sections));
      } else {
        setAvailableSections(initialSections);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.info("Analyze request aborted");
      } else {
        console.error("Error analyzing experiment:", err);
        setError(err.message || "Failed to analyze experiment");
        setAvailableSections(initialSections);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHeaderIcon = (headerText, level) => {
    const text = headerText.toLowerCase();

    // Main section icons
    if (text.includes("executive") || text.includes("summary")) return "📋";
    if (text.includes("experiment") && text.includes("detail")) return "🔬";
    if (text.includes("key finding")) return "🔑";
    if (text.includes("biological") && text.includes("impact")) return "🧬";
    if (text.includes("knowledge") && text.includes("graph")) return "🕸️";
    if (text.includes("application")) return "🚀";
    if (text.includes("research") && text.includes("connection")) return "🔗";
    if (text.includes("visual") && text.includes("insight")) return "📊";
    if (text.includes("future") && text.includes("research")) return "🔮";

    // Sub-section icons
    if (text.includes("research question") || text.includes("hypothesis"))
      return "❓";
    if (text.includes("methodology") || text.includes("method")) return "⚙️";
    if (text.includes("subject") || text.includes("condition")) return "🧪";
    if (text.includes("timeline")) return "📅";
    if (text.includes("cellular")) return "🦠";
    if (text.includes("physiological")) return "💪";
    if (text.includes("molecular") || text.includes("genetic")) return "🧬";
    if (text.includes("health") || text.includes("medical")) return "⚕️";
    if (text.includes("space") && text.includes("exploration")) return "🛸";
    if (text.includes("mars")) return "🔴";
    if (text.includes("earth") || text.includes("clinical")) return "🌍";
    if (text.includes("technology") || text.includes("development"))
      return "⚡";
    if (text.includes("mission")) return "🛰️";
    if (text.includes("interdisciplinary")) return "🔬";
    if (
      text.includes("chart") ||
      text.includes("graph") ||
      text.includes("visualization")
    )
      return "📈";
    if (text.includes("open question")) return "❔";
    if (text.includes("follow-up") || text.includes("suggested")) return "🔄";
    if (text.includes("gap")) return "🕳️";
    if (text.includes("roadmap") || text.includes("next step")) return "🗺️";
    if (text.includes("recommended")) return "📋";

    // Generic icons by level
    if (level === 1) return "📄";
    if (level === 2) return "📌";
    if (level === 3) return "▪️";

    return null;
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let currentList = [];
    let currentListType = null;
    let inCodeBlock = false;
    let codeBlockLines = [];
    let tableLines = [];
    let inTable = false;

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = currentListType === "ordered" ? "ol" : "ul";
        elements.push(
          <ListTag key={`list-${elements.length}`} className="md-list">
            {currentList}
          </ListTag>,
        );
        currentList = [];
        currentListType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockLines.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="md-code-block">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>,
        );
        codeBlockLines = [];
      }
    };

    const flushTable = () => {
      if (tableLines.length > 0) {
        const headers = tableLines[0].split("|").filter((cell) => cell.trim());
        const rows = tableLines
          .slice(2)
          .map((row) => row.split("|").filter((cell) => cell.trim()));

        elements.push(
          <div key={`table-${elements.length}`} className="md-table-wrapper">
            <table className="md-table">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i}>{header.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        tableLines = [];
      }
    };

    const processBoldAndItalic = (text) => {
      const parts = [];
      let current = "";
      let i = 0;

      while (i < text.length) {
        if (text.substr(i, 2) === "**") {
          if (current) parts.push(current);
          current = "";
          const endIndex = text.indexOf("**", i + 2);
          if (endIndex !== -1) {
            parts.push(
              <strong key={`b-${i}`}>{text.substring(i + 2, endIndex)}</strong>,
            );
            i = endIndex + 2;
            continue;
          }
        } else if (
          text[i] === "*" &&
          text[i - 1] !== "*" &&
          text[i + 1] !== "*"
        ) {
          if (current) parts.push(current);
          current = "";
          const endIndex = text.indexOf("*", i + 1);
          if (endIndex !== -1 && text[endIndex + 1] !== "*") {
            parts.push(
              <em key={`i-${i}`}>{text.substring(i + 1, endIndex)}</em>,
            );
            i = endIndex + 1;
            continue;
          }
        }
        current += text[i];
        i++;
      }

      if (current) parts.push(current);
      return parts.length > 1 ? parts : text;
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        tableLines.push(line);
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      // Headers
      if (line.startsWith("### ")) {
        flushList();
        const headerText = line.replace("### ", "");
        const icon = getHeaderIcon(headerText, 3);
        elements.push(
          <h3 key={index} className="md-h3">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h3>,
        );
        return;
      }
      if (line.startsWith("## ")) {
        flushList();
        const headerText = line.replace("## ", "");
        const icon = getHeaderIcon(headerText, 2);
        elements.push(
          <h2 key={index} className="md-h2">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h2>,
        );
        return;
      }
      if (line.startsWith("# ")) {
        flushList();
        const headerText = line.replace("# ", "");
        const icon = getHeaderIcon(headerText, 1);
        elements.push(
          <h1 key={index} className="md-h1">
            {icon && <span className="header-icon">{icon}</span>}
            {headerText}
          </h1>,
        );
        return;
      }

      // Blockquotes
      if (line.trim().startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote key={index} className="md-blockquote">
            {processBoldAndItalic(line.trim().substring(2))}
          </blockquote>,
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        elements.push(<hr key={index} className="md-hr" />);
        return;
      }

      // Ordered Lists
      if (/^\d+\./.test(line.trim())) {
        if (currentListType !== "ordered") {
          flushList();
          currentListType = "ordered";
        }
        const content = line.trim().replace(/^\d+\.\s*/, "");
        currentList.push(
          <li key={index} className="md-li">
            {processBoldAndItalic(content)}
          </li>,
        );
        return;
      }

      // Unordered Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        if (currentListType !== "unordered") {
          flushList();
          currentListType = "unordered";
        }
        const content = line.trim().substring(2);
        currentList.push(
          <li key={index} className="md-li">
            {processBoldAndItalic(content)}
          </li>,
        );
        return;
      }

      // Empty line
      if (line.trim() === "") {
        flushList();
        elements.push(<div key={index} className="md-spacer" />);
        return;
      }

      // Regular paragraph
      flushList();
      const content = processBoldAndItalic(line);
      elements.push(
        <p key={index} className="md-p">
          {content}
        </p>,
      );
    });

    // Flush any remaining elements
    flushList();
    flushCodeBlock();
    flushTable();

    return <div className="markdown-content">{elements}</div>;
  };

  const renderSection = (sectionKey, sectionTitle) => {
    const sectionContent = analysis?.sections?.[sectionKey];

    // *** MODIFICATION FOR KNOWLEDGE GRAPH RENDERING ***
    if (sectionKey === "knowledgeGraph") {
      // Check if the content is a structured object (successfully parsed JSON)
      if (
        typeof sectionContent === "object" &&
        sectionContent !== null &&
        sectionContent.nodes
      ) {
        return (
          <div className="analysis-section" id={sectionKey}>
            <h2 className="md-h2">
              <span className="header-icon">🕸️</span>
              Knowledge Graph
            </h2>
            <div className="section-content">
              {/* 💡 RENDER THE KnowledgeGraph COMPONENT (using react-force-graph-2d) 💡 */}
              <KnowledgeGraph graphData={sectionContent} />

              {/* Render the summary text using standard markdown renderer */}
              {sectionContent.summary && renderMarkdown(sectionContent.summary)}
            </div>
          </div>
        );
      }

      // Fall through to standard markdown rendering for the textual schematic (fallback)
      // If content is a string (failed JSON parse) or empty.
    }

    // *** END KNOWLEDGE GRAPH MODIFICATION ***

    if (sectionContent && sectionContent.length > 0) {
      // Content exists and is a string, render it as markdown
      return (
        <div className="analysis-section" id={sectionKey}>
          <div className="section-content">
            {renderMarkdown(sectionContent)}
          </div>
        </div>
      );
    } else {
      // Content is missing or empty, render a fallback/placeholder
      let placeholderText = `The AI did not generate content for the ${sectionTitle} section. This may be due to limitations in the source data or the analysis model's response.`;
      let specialTitle = sectionTitle;

      if (sectionKey === "knowledgeGraph") {
        specialTitle = "Knowledge Graph (Textual Representation)";
        placeholderText = `The Gemini API did not provide the necessary data structure for a graphical Knowledge Graph visualization. Instead, here is a detailed textual description of the experiment's core entities and their relationships.

**If the AI had provided data for the Knowledge Graph, we would render an interactive network diagram here.**

***
### **Knowledge Graph Entity & Relation Blueprint**

**Core Entity:** [Experiment Title] (ID: ${id})
**Key Subjects:** e.g., *Arabidopsis thaliana*, Astronauts, *E. coli*
**Primary Relation:** **[Subject]** -*SHOWS\_RESPONSE\_TO*-> **[Condition]** -*IMPACTS*-> **[Biological_Pathway]**

#### **Placeholder Example Nodes:**
* **Node: Microgravity** (Type: Condition)
* **Node: Gene Expression** (Type: Biological Pathway)
* **Node: Bone Density** (Type: Health Metric)

#### **Placeholder Example Relations (Textual Schematic):**
1.  **Microgravity** --*CAUSES*--> **Up-regulation of Gene 'X'**
2.  **Astronauts** --*EXHIBITED*--> **Reduced Bone Density** (after 6 months)
3.  **Reduced Bone Density** --*MITIGATED\_BY*--> **Exercise Protocol 'Y'**
***
Please run the analysis again or check the raw API response for structured data.`;
      } else if (sectionKey === "visualInsights") {
        specialTitle = "Visual Insights (Descriptive Placeholder)";
        placeholderText = `The Gemini API did not provide the image or data necessary to render interactive charts or a visualization.

**If the AI had provided data for Visual Insights, we would render key charts here.**

***
### **Recommended Visualizations (Textual Description):**

Based on this experiment, the following visualizations would be highly beneficial:

1.  **Type:** **Timeline Chart**
    * **Data:** Key experimental events (launch, data collection points, return) vs. Time.
    * **Insight:** A clear roadmap of the experiment's duration and phase changes.
2.  **Type:** **Bar Chart or Heatmap**
    * **Data:** Differential Gene Expression (Fold Change) for the top 10 affected genes.
    * **Insight:** Clearly highlight which biological pathways were most significantly activated or suppressed by the space environment.
3.  **Type:** **Scatter Plot**
    * **Data:** Radiation Exposure (x-axis) vs. Observed Mutation Rate (y-axis).
    * **Insight:** Quantify the linear or non-linear relationship between deep-space radiation and biological damage.
***
Please attempt to re-analyze the data or seek the raw analysis output for visualization data recommendations.`;
      } else if (!availableSections.includes(sectionKey)) {
        // If a section key is in the navigation list but wasn't even returned in the analysis.sections object,
        // we treat it as truly unavailable, even with the relaxed check.
        return null;
      }

      // Default title if not provided by sectionNavigation
      const defaultTitle =
        sectionNavigation.find((s) => s.key === sectionKey)?.title ||
        sectionKey
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

      return (
        <div className="analysis-section" id={sectionKey}>
          <h2 className="md-h2">
            <span className="header-icon">
              {getHeaderIcon(defaultTitle, 2) || "📌"}
            </span>
            {specialTitle}
          </h2>
          <div className="section-content">
            <div className="info-box">
              <p>
                <strong>⚠️ Analysis Data Missing:</strong> {placeholderText}
              </p>
            </div>
            {/* If the original content was an empty string but the key was present, this is a more accurate message */}
            {sectionKey !== "knowledgeGraph" &&
              sectionKey !== "visualInsights" && (
                <div className="md-p">
                  <p>
                    *Note: If this section consistently remains empty, the
                    underlying AI model may not be producing output for it, or
                    the content did not pass minimum length/quality thresholds.*
                  </p>
                </div>
              )}
          </div>
        </div>
      );
    }
  };

  const sectionNavigation = [
    { key: "all", title: "All Sections", icon: "☰" },
    { key: "executiveSummary", title: "Executive Summary", icon: "📋" },
    { key: "experimentDetails", title: "Experiment Details", icon: "🔬" },
    { key: "keyFindings", title: "Key Findings", icon: "🔑" },
    { key: "biologicalImpacts", title: "Biological Impacts", icon: "🧬" },
    { key: "knowledgeGraph", title: "Knowledge Graph", icon: "🕸️" },
    { key: "practicalApplications", title: "Applications", icon: "🚀" },
    { key: "researchConnections", title: "Research Connections", icon: "🔗" },
    { key: "futureResearch", title: "Future Research", icon: "🔮" },
  ];

  if (isLoading) {
    return (
      <div className="experiment-details-page">
        <div className="loading-container modern">
          <div className="loading-content">
            <div className="loading-icon-wrapper">
              <div className="orbit-spinner">
                <div className="orbit"></div>
                <div className="orbit"></div>
                <div className="orbit"></div>
              </div>
              <div className="center-icon">🚀</div>
            </div>

            <h2 className="loading-title">Loading Experiment</h2>
            <p className="loading-subtitle">
              Fetching data from NASA archives...
            </p>

            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBookmarkToggle = () => {
    if (!experiment) return;

    if (bookmarked) {
      if (removeBookmark(experiment.id)) {
        setBookmarked(false);
      }
    } else {
      if (addBookmark(experiment)) {
        setBookmarked(true);
      }
    }
  };

  const handleBackToSearch = () => {
    if (location.state && location.state.fromSearch) {
      navigate("/search", {
        state: {
          preserveResults: true,
          searchQuery: location.state.searchQuery,
          searchResults: location.state.searchResults,
        },
      });
    } else {
      navigate("/search");
    }
  };

  if (error && !experiment) {
    return (
      <div className="experiment-details-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="experiment-details-page">
      <div className="details-header-controls">
        <button onClick={handleBackToSearch} className="back-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Search
        </button>

        <button
          onClick={handleBookmarkToggle}
          className={`details-bookmark-button ${bookmarked ? "bookmarked" : ""}`}
          title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      <div className="experiment-details-wrapper">
        {/* Experiment Header */}
        <div className="experiment-header-section">
          <h1 className="experiment-main-title">{experiment?.title}</h1>

          <div className="experiment-meta">
            <div className="meta-item">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div>
                <strong>Authors:</strong>
                <p>{experiment?.authors}</p>
              </div>
            </div>

            <a
              href={experiment?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="publication-link"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              View Original Publication
            </a>
          </div>
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="analysis-loading">
            <div className="loading-spinner-large"></div>
            <h3>Analyzing Experiment with AI...</h3>
            <p>Generating comprehensive analysis including all 8 sections...</p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#94a3b8",
                marginTop: "1rem",
              }}
            >
              This includes: Executive Summary, Experiment Details, Key
              Findings, Biological Impacts, Knowledge Graph, Applications,
              Research Connections, and Future Research
            </p>
          </div>
        )}

        {/* Analysis Error */}
        {error && analysis === null && (
          <div className="analysis-error">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Analysis Failed</h3>
            <p>{error}</p>
            <button onClick={analyzeExperiment} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {analysis && availableSections.length > 0 && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(103, 232, 249, 0.1)",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              color: "#67e8f9",
            }}
          >
            <strong>
              Debug: Sections Available ({availableSections.length}):
            </strong>
            <br />
            {availableSections.join(", ")}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-container">
            <div className="analysis-header">
              <h2>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                AI-Generated Analysis
              </h2>
            </div>

            {/* Section Navigation */}
            <div className="section-navigation">
              {sectionNavigation.map((section) => {
                const isAvailable =
                  section.key === "all" ||
                  availableSections.includes(section.key);

                return (
                  <button
                    key={section.key}
                    className={`nav-btn ${activeSection === section.key ? "active" : ""}`}
                    onClick={() => isAvailable && setActiveSection(section.key)}
                    disabled={!isAvailable}
                    // Removed the "disabled" class logic as we want all to show
                    title={
                      !isAvailable ? "Section not available in analysis" : ""
                    }
                  >
                    <span className="nav-icon">{section.icon}</span>
                    {section.title}
                  </button>
                );
              })}
            </div>

            {/* Analysis Content */}
            <div className="analysis-content">
              {activeSection === "all" ? (
                <div className="all-sections">
                  {analysis.sections?.fullAnalysis ? (
                    <div className="full-analysis">
                      {renderMarkdown(analysis.sections.fullAnalysis)}
                    </div>
                  ) : (
                    <>
                      {/* Render ALL sections here, which will now use the renderSection fallback if content is missing */}
                      {renderSection("executiveSummary", "Executive Summary")}
                      {renderSection("experimentDetails", "Experiment Details")}
                      {renderSection("keyFindings", "Key Findings")}
                      {renderSection("biologicalImpacts", "Biological Impacts")}
                      {renderSection("knowledgeGraph", "Knowledge Graph")}
                      {renderSection(
                        "practicalApplications",
                        "Practical Applications",
                      )}
                      {renderSection(
                        "researchConnections",
                        "Research Connections",
                      )}
                      {renderSection("futureResearch", "Future Research")}
                    </>
                  )}
                </div>
              ) : (
                renderSection(
                  activeSection,
                  sectionNavigation.find((s) => s.key === activeSection)?.title,
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDetails;
