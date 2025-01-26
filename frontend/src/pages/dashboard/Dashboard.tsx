import React, { useEffect, useState } from "react";
import { Typography, CircularProgress, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import axiosInstance from "../../utils/axiosInstance";
import DonutChart from "../../components/Charts/DonutChart";
import LineChart from "../../components/Charts/LineChart";
import StatisticsCard from "../../components/Statistics/StatisticsCard";
import RecentCases from "../../components/RecentItems/RecentCases";
import RecentISF from "../../components/RecentItems/RecentISF";
import { countTasksByDate } from "../../utils/countTasksByDate";
import { Case } from "../../types";
import {
  AccountCircle,
  BlurLinear,
  CasesSharp,
  FindReplace,
  Memory,
} from "@mui/icons-material";

interface StatisticsData {
  total_evidences: number;
  total_evidences_progress: number;
  total_cases: number;
  total_users: number;
  total_symbols: number;
  total_evidences_windows: number;
  total_evidences_linux: number;
  tasks: Array<{ date_created: string }>;
  last_5_cases: Case[];
  last_5_isf: Array<{ name: string }>;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = "dark";

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response =
          await axiosInstance.get<StatisticsData>("/core/statistics/");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h6">Failed to load data.</Typography>
      </Box>
    );
  }
  const tasksStats = countTasksByDate(data.tasks);

  return (
    <Box p={3}>
      <Grid container justifyContent="center" spacing={3}>
        {/* Statistics Cards */}
        <Grid size={2}>
          <StatisticsCard
            title="Evidences"
            value={data.total_evidences}
            icon={<Memory fontSize="large" color="error" />}
          />
        </Grid>
        <Grid size={2}>
          <StatisticsCard
            title="Processing"
            value={data.total_evidences_progress}
            icon={<FindReplace fontSize="large" color="warning" />}
          />
        </Grid>
        <Grid size={2}>
          <StatisticsCard
            title="Cases"
            value={data.total_cases}
            icon={<CasesSharp fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid size={2}>
          <StatisticsCard
            title="Total Users"
            value={data.total_users}
            icon={<AccountCircle fontSize="large" color="info" />}
          />
        </Grid>
        <Grid size={2}>
          <StatisticsCard
            title="Symbols"
            value={data.total_symbols}
            icon={<BlurLinear fontSize="large" color="secondary" />}
          />
        </Grid>

        {/* Charts */}
        <Grid size={4}>
          <DonutChart
            totalWindows={data.total_evidences_windows}
            totalLinux={data.total_evidences_linux}
            theme={theme}
          />
        </Grid>
        <Grid size={8}>
          <LineChart
            dates={tasksStats.dates}
            counts={tasksStats.counts}
            theme={theme}
          />
        </Grid>

        {/* Recent Items */}
        <Grid size={6}>
          <RecentCases cases={data.last_5_cases} />
        </Grid>
        <Grid size={6}>
          <RecentISF isfList={data.last_5_isf} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
