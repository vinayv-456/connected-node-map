import { useEffect, useState } from "react";
import "./App.css";
import ForceGraph2D from "react-force-graph-2d";
import { sampleNodalMap } from "./react_nodalmap_test_data";

function App() {
  const [graphData, setGraphData] = useState({});
  // can memoize
  useEffect(() => {
    // console.log("sampleNodalMap", sampleNodalMap);
    let nodes = [];
    let links = [];
    sampleNodalMap.forEach((org) => {
      nodes = [
        ...nodes,
        {
          ...org.organization,
          id: org.organization.cin,
          val: 8,
          desc: org.organization.incorporationDate,
        },
        ...org.members
          .filter((member) => {
            return (
              nodes.length === 0 ||
              !nodes.some((node) => member.din === node.id)
            );
          })
          .map((member) => ({
            ...member,
            id: member.din,
            val: 4,
            desc: member.currentDesignation,
          })),
      ];
      const organizationId = org.organization.cin;
      links = [
        ...links,
        ...org.members.map((member) => {
          return {
            source: organizationId,
            target: member.din,
          };
        }),
      ];
    });
    console.log("nodes", nodes, "links", links);
    setGraphData({
      nodes,
      links,
    });
  }, []);

  const [highlightNodes, setHighlightNodes] = useState([]);
  const [highlightLinks, setHighlightLinks] = useState([]);
  const [hoverNode, setHoverNode] = useState(null);

  // const updateHighlight = () => {
  //   setHighlightNodes(highlightNodes);
  //   setHighlightLinks(highlightLinks);
  // };

  const handleNodeHover = (selectedNode) => {
    // highlightNodes.clear();
    // highlightLinks.clear();
    if (selectedNode) {
      // highlightNodes.add(selectedNode);
      console.log("data", selectedNode, graphData.links, graphData.nodes);
      const hlLinks = graphData.links.filter(
        (link) =>
          selectedNode.id === link.source.id ||
          selectedNode.id === link.target.id
      );

      setHighlightNodes([
        selectedNode,
        ...graphData.nodes.filter((node) => {
          return hlLinks.some(
            (link) => link.target.id === node.id || link.source.id === node.id
          );
        }),
      ]);
      setHighlightLinks(hlLinks);
    }

    setHoverNode(selectedNode || null);
  };

  console.log("highlightLinks", highlightLinks, highlightNodes);

  return (
    <div className="App">
      {graphData?.nodes?.length && (
        <ForceGraph2D
          // nodeLabel={(d) => d.name}
          nodeColor={(d) => {
            // return highlightNodes.some((hl) => hl.index === d.index)
            return highlightNodes.some((hl) => hl.index === d.index)
              ? "red"
              : "";
          }}
          linkColor={(link) => {
            // console.log("sas", highlightLinks, link);
            return highlightLinks.some((hl) => hl.index === link.index)
              ? "red"
              : "grey";
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.din
              ? `member: ${node.name}`
              : `Organization: ${node.name}`;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = highlightNodes.some((hn) => hn.id === node.id)
              ? "red"
              : "grey";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          onNodeClick={handleNodeHover}
          graphData={graphData}
        />
      )}
    </div>
  );
}

export default App;
