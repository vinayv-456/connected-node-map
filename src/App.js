import { useEffect, useState } from "react";
import "./App.css";
import ForceGraph2D from "react-force-graph-2d";
import { sampleNodalMap } from "./react_nodalmap_test_data";

function App() {
  const [graphData, setGraphData] = useState({});
  useEffect(() => {
    console.log("sampleNodalMap", sampleNodalMap);
    let nodes = [];
    let links = [];
    sampleNodalMap.forEach((org) => {
      nodes = [
        ...nodes,
        { ...org.organization, id: org.organization.cin, val: 5 },
        ...org.members.map((member) => ({ ...member, id: member.din, val: 1 })),
      ];
      const organizationId = org.organization.cin;
      links = [
        ...links,
        ...org.members.map((member) => ({
          source: organizationId,
          target: member.din,
        })),
      ];
    });
    console.log("nodes", nodes, "links", links);
    setGraphData({
      nodes,
      links,
    });
  }, []);
  return (
    <div className="App">
      <ForceGraph2D graphData={graphData} />
    </div>
  );
}

export default App;
