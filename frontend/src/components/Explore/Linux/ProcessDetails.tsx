import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import {
  CircularProgress,
  Typography,
  List,
  ListItemIcon,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  AddCircleOutline,
  AlignHorizontalLeft,
  BugReport,
  Fingerprint,
  InfoRounded,
  PermIdentity,
  Terminal,
} from "@mui/icons-material";
import { useSigma } from "@react-sigma/core";
import { LinuxProcessInfo, EnrichedProcessData } from "../../../types";
import { useSnackbar } from "../../SnackbarProvider";

interface ProcessDetailsProps {
  process: LinuxProcessInfo;
  enrichedData: EnrichedProcessData | null;
  setEnrichedData: React.Dispatch<
    React.SetStateAction<EnrichedProcessData | null>
  >;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProcessDetails: React.FC<ProcessDetailsProps> = ({
  process,
  enrichedData,
  setEnrichedData,
  show,
  setShow,
}) => {
  const { display_message } = useSnackbar();
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Fetch the enriched process data
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/evidence/${id}/process/${process.PID}/enriched/`,
        );

        const data = response.data.data;
        setEnrichedData(data);

        // Not equivalent found yet but lets keep that for later.
        // const netScanData = data["volatility3.plugins.windows.netscan.NetScan"];
        // if (netScanData && Array.isArray(netScanData)) {
        //   netScanData.forEach((netEntry: NetworkInfo) => {
        //     processNetEntry(netEntry, process, graph);
        //   });
        // }

        // const netStatData = data["volatility3.plugins.windows.netstat.NetStat"];
        // if (netStatData && Array.isArray(netStatData)) {
        //   netStatData.forEach((netEntry: NetworkInfo) => {
        //     processNetEntry(netEntry, process, graph);
        //   });
        // }

        sigma.refresh();
      } catch (error) {
        display_message(
          "error",
          `Error fetching enriched process data: ${error}`,
        );
        console.error("Error fetching enriched process data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    process,
    process.PID,
    id,
    graph,
    sigma,
    setEnrichedData,
    display_message,
  ]);

  // If at some point there is relevant network info we keep this.
  // function processNetEntry(
  //   netEntry: NetworkInfo,
  //   process: LinuxProcessInfo,
  //   graph: Graph,
  // ) {
  //   const parentId = process.PID.toString();

  //   const foreignAddr = netEntry.ForeignAddr || "?";
  //   const foreignPort = netEntry.ForeignPort || "?";
  //   const localPort = netEntry.LocalPort || "?";
  //   const localAddr = netEntry.LocalAddr || "?";

  //   const state = netEntry.State || "?";

  //   const nodeId = `${foreignAddr}:${foreignPort}`;

  //   // Check if node already exists
  //   if (!graph.hasNode(nodeId)) {
  //     // Get position near the process node
  //     const parentAttributes = graph.getNodeAttributes(parentId);
  //     const { x: px, y: py } = parentAttributes;

  //     const angle = Math.random() * 2 * Math.PI;
  //     const distance = 100;
  //     const x = px + distance * Math.cos(angle);
  //     const y = py + distance * Math.sin(angle);

  //     graph.addNode(nodeId, {
  //       label: `${foreignAddr}:${foreignPort}`,
  //       size: 3,
  //       color: "#ffa726", // Blue color for network nodes
  //       x: x,
  //       y: y,
  //     });
  //   }

  //   if (!graph.hasEdge(parentId, nodeId)) {
  //     graph.addEdge(parentId, nodeId, {
  //       label: `${localAddr}:${localPort} (${state})`,
  //       size: 1,
  //       color: "#ffa726",
  //       type: "arrow",
  //     });
  //   }
  // }

  sigma.refresh();

  if (loading) {
    return <CircularProgress />;
  }

  if (!enrichedData) {
    return <Typography variant="body1">No data available.</Typography>;
  }

  return (
    <>
      <List
        dense
        sx={{
          "& .MuiListItemText-secondary": {
            color: "primary.main",
          },
          "& .MuiListItemText-primary": {
            color: "inherit",
          },
        }}
      >
        <ListItem>
          <ListItemIcon>
            <InfoRounded />
          </ListItemIcon>
          <ListItemText
            primary={<strong>PID</strong>}
            secondary={process.PID}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Fingerprint />
          </ListItemIcon>
          <ListItemText
            primary={<strong>Process Name</strong>}
            secondary={process.COMM}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AlignHorizontalLeft />
          </ListItemIcon>
          <ListItemText
            primary={<strong>PPID</strong>}
            secondary={process.PPID}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AddCircleOutline />
          </ListItemIcon>
          <ListItemText
            primary={<strong>Thread ID</strong>}
            secondary={process.TID}
          />
        </ListItem>
        {enrichedData["volatility3.plugins.windows.cmdline.CmdLine"] && (
          <ListItem>
            <ListItemIcon>
              <Terminal />
            </ListItemIcon>
            <ListItemText
              primary={<strong>Command Line Arguments</strong>}
              secondary={
                enrichedData["volatility3.plugins.windows.cmdline.CmdLine"][0]
                  .Args || "N/A"
              }
            />
          </ListItem>
        )}
        {enrichedData["volatility3.plugins.windows.sessions.Sessions"] &&
          enrichedData["volatility3.plugins.windows.sessions.Sessions"].map(
            (session, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <PermIdentity />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <strong>{`Session ID ${session["Session ID"] || "N/A"}`}</strong>
                  }
                  secondary={`${session["User Name"] || "N/A"}`}
                />
              </ListItem>
            ),
          )}
        {process.anomalies && process.anomalies.length > 0 && (
          <ListItem>
            <ListItemIcon>
              <BugReport />
            </ListItemIcon>
            <ListItemText
              sx={{
                "& .MuiListItemText-secondary": {
                  color: "warning.main",
                },
                "& .MuiListItemText-primary": {
                  color: "inherit",
                },
              }}
              primary={<strong>Anomalies:</strong>}
              secondary={
                <ul>
                  {process.anomalies.map((anomaly, index) => (
                    <li key={index}>{anomaly}</li>
                  ))}
                </ul>
              }
            />
          </ListItem>
        )}
      </List>

      <div style={{ display: "flex", justifyContent: "center", margin: 16 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setShow(!show);
          }}
          color="secondary"
        >
          {show ? "Less" : "More"}
        </Button>
      </div>
    </>
  );
};

export default ProcessDetails;
