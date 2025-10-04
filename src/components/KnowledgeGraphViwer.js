// This is a conceptual file and does not exist in your uploaded code
import React from 'react';
// Assume you install and import a library like 'vis-network' or similar wrapper
import { Network } from 'react-vis-network'; 

const KnowledgeGraphViewer = ({ graphData }) => {
  if (!graphData || graphData.nodes.length === 0) {
    // Render the original textual blueprint fallback if the data is empty or invalid
    return (
        <div className="info-box">
            <p>⚠️ The structured data for the graph was empty. Showing textual blueprint instead.</p>
            {/* You would re-render the textual schematic here based on the original markdown fallback */}
        </div>
    );
  }

  // Map the structured JSON data to the library's required format
  const data = {
    nodes: graphData.nodes.map(node => ({
      id: node.id, 
      label: node.label, 
      title: node.type // Use the type as a tooltip
    })),
    edges: graphData.edges.map(edge => ({
      from: edge.source, 
      to: edge.target, 
      label: edge.relationship
    }))
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
        {/* Render the actual interactive graph using the library */}
        <Network data={data} options={{ physics: true, edges: { arrows: 'to' } }} />
        <p className="md-p">Summary: {graphData.summary}</p>
    </div>
  );
};

export default KnowledgeGraphViewer;