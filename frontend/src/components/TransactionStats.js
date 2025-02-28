import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const TransactionStats = ({ stats, blockchain }) => {
  if (!stats) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        アドレスの概要
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                トランザクション数
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    合計
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalTransactions}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    送金
                  </Typography>
                  <Typography variant="h6">
                    {stats.sentTransactions}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    受領
                  </Typography>
                  <Typography variant="h6">
                    {stats.receivedTransactions}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                金額
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    送金合計
                  </Typography>
                  <Typography variant="h6" color="error">
                    {stats.totalSent.toFixed(8)}{" "}
                    {blockchain === "bitcoin" ? "BTC" : "ETH"}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    受領合計
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {stats.totalReceived.toFixed(8)}{" "}
                    {blockchain === "bitcoin" ? "BTC" : "ETH"}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    差額
                  </Typography>
                  <Typography
                    variant="h6"
                    color={stats.balance >= 0 ? "success.main" : "error"}
                  >
                    {stats.balance.toFixed(8)}{" "}
                    {blockchain === "bitcoin" ? "BTC" : "ETH"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionStats;