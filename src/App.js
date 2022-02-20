import { useEffect, useState } from "react";
import "./App.css";
import ForceGraph2D from "react-force-graph-2d";
import { sampleNodalMap } from "./react_nodalmap_test_data";

function App() {
  const [graphData, setGraphData] = useState({});
  // can memoize
  useEffect(() => {
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
    setGraphData({
      nodes,
      links,
    });
  }, []);

  const [highlightNodes, setHighlightNodes] = useState([]);
  const [highlightLinks, setHighlightLinks] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [history, setHistory] = useState([]);

  // const updateHighlight = () => {
  //   setHighlightNodes(highlightNodes);
  //   setHighlightLinks(highlightLinks);
  // };

  const isNodePresentInLink = (link, nodeId) => {
    return nodeId === link.source.id || nodeId === link.target.id;
  };

  const isCommonNodePresent = (link1, link2) => {
    if (isNodePresentInLink(link1, link2.source.id)) {
      return link2.source.id;
    } else if (isNodePresentInLink(link1, link2.target.id)) {
      return link2.target.id;
    }
  };

  const checkIsNodeCommon = (id) => {
    const newNodeLinks = graphData.links.filter((link) => {
      return id === link.source.id || id === link.target.id;
    });
    return selectedNodes.every((sn) =>
      newNodeLinks.some((link) => isNodePresentInLink(link, sn.id))
    );
  };

  const handleNodeClick = (selectedNode) => {
    // highlightNodes.clear();
    // highlightLinks.clear();
    // new selection
    console.log(
      "csa",
      selectedNodes.some((sn) => sn.index === selectedNode.index)
    );
    if (!selectedNodes.some((sn) => sn.index === selectedNode.index)) {
      const tempSelectedNodes = [...selectedNodes, selectedNode];
      console.log("data", selectedNode, graphData.links, graphData.nodes);
      const newNodeLinks = graphData.links.filter((link) => {
        return (
          selectedNode.id === link.source.id ||
          selectedNode.id === link.target.id
        );
      });
      let hlLinks = [];
      if (tempSelectedNodes.length === 1) {
        hlLinks = [...newNodeLinks];
      } else {
        highlightLinks.forEach((link1) =>
          newNodeLinks.forEach((link2) => {
            const commonId = isCommonNodePresent(link1, link2);
            if (commonId && checkIsNodeCommon(commonId)) {
              hlLinks = [...hlLinks, link1, link2];
            }
          })
        );
      }
      const hlNodes = [
        ...tempSelectedNodes,
        ...graphData.nodes.filter((node) => {
          return hlLinks.some(
            (link) => link.target.id === node.id || link.source.id === node.id
          );
        }),
      ];
      setHighlightNodes(hlNodes);
      setHighlightLinks(hlLinks);
      setSelectedNodes(tempSelectedNodes || null);
      setHistory([
        ...history,
        {
          highlightLinks: hlLinks,
          highlightNodes: hlNodes,
          selectedNodes: tempSelectedNodes,
        },
      ]);
    } else {
      const tempSelectedNodes = selectedNodes.filter(
        (n) => n.index !== selectedNode.index
      );
      if (tempSelectedNodes.length) {
        const nodesProps = history.find(
          (hx) =>
            hx.selectedNodes.length === tempSelectedNodes.length &&
            tempSelectedNodes.every((node) =>
              hx.selectedNodes.some((sn) => sn.index === node.index)
            )
        );
        setHighlightLinks(nodesProps.highlightLinks);
        setHighlightNodes(nodesProps.highlightNodes);
        console.log("nodesProps", history, nodesProps, tempSelectedNodes);
      } else {
        setHighlightLinks([]);
        setHighlightNodes([]);
      }
      setSelectedNodes(tempSelectedNodes);
    }
  };

  console.log(
    "highlightLinks",
    highlightLinks,
    highlightNodes,
    selectedNodes,
    history
  );

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
          onNodeClick={handleNodeClick}
          graphData={graphData}
        />
      )}
    </div>
  );
}

export default App;
