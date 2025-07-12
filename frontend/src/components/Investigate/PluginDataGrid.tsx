import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { Artefact } from "../../types";

interface PluginDataGridProps {
  pluginName: string;
}

const PluginDataGrid: React.FC<PluginDataGridProps> = ({ pluginName }) => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Artefact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const apiRef = useGridApiRef();

  const columns: GridColDef[] = React.useMemo(() => {
    if (!data[0]) {
      return [];
    }
    return Object.keys(data[0])
      .filter((key) => key !== "__children" && key !== "id")
      .map((key) => ({
        field: key,
        headerName: key,
        renderCell: (params) => {
          if (key === "File output" && params.value !== "Disabled") {
            return (
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open(`/media/${id}/${params.value}`)}
              >
                Download
              </Button>
            );
          }

          if (key === "Disasm" || key === "Hexdump") {
            return <pre>{params.value}</pre>;
          }

          return typeof params.value === "boolean" ? (
            params.value ? (
              <Checkbox checked={true} color="success" />
            ) : (
              <IconButton color="error">
                <CloseIcon />
              </IconButton>
            )
          ) : params.value !== null ? (
            params.value
          ) : (
            ""
          );
        },
      }));
  }, [data, id]);

  const autosizeOptions = React.useMemo(
    () => ({
      columns: [...columns].map((col) => col.headerName ?? ""),
      includeOutliers: true,
      includeHeaders: true,
    }),
    [columns],
  );

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/evidence/${id}/plugin/${pluginName}`,
        );
        // Assign consistent unique IDs to each row and flatten children
        const artefactsWithId: Artefact[] = [];
        response.data.artefacts.forEach((artefact: Artefact, index: number) => {
          artefactsWithId.push({ ...artefact, id: index });
          if (
            Array.isArray(artefact.__children) &&
            artefact.__children.length
          ) {
            artefact.__children.forEach((child: Artefact, idx: number) => {
              artefactsWithId.push({ ...child, id: `${index}-${idx}` });
            });
          }
        });
        console.log(artefactsWithId);
        setData(artefactsWithId);
      } catch (error) {
        console.error("Error fetching case details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, [id, pluginName]);

  // Add this useEffect to call autosizeColumns after the data is loaded
  useEffect(() => {
    if (!loading && data.length > 0) {
      const timeoutId = setTimeout(() => {
        if (apiRef.current) {
          apiRef.current.autosizeColumns(autosizeOptions);
        }
      }, 200); // Delay to ensure DataGrid has rendered
      return () => clearTimeout(timeoutId);
    }
  }, [loading, data, apiRef, autosizeOptions]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DataGrid
        disableDensitySelector
        showToolbar
        rows={data}
        density="compact"
        sx={{ height: "80vh" }}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        loading={loading}
        autosizeOnMount
        autosizeOptions={autosizeOptions}
        apiRef={apiRef}
        getRowHeight={() => "auto"}
      />
    </Box>
  );
};

export default PluginDataGrid;
