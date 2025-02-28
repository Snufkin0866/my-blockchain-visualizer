import React from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const TransactionSearchForm = ({
  blockchain,
  setBlockchain,
  address,
  setAddress,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  handleSearch,
  loading,
  error,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box component="form" noValidate sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="blockchain-select-label">
                ブロックチェーン
              </InputLabel>
              <Select
                labelId="blockchain-select-label"
                value={blockchain}
                label="ブロックチェーン"
                onChange={(e) => setBlockchain(e.target.value)}
              >
                <MenuItem value="bitcoin">Bitcoin</MenuItem>
                <MenuItem value="ethereum">Ethereum</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="ウォレットアドレス"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="検索するウォレットアドレスを入力"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="最小数量"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0.00000000"
              variant="outlined"
              inputProps={{ step: "any", min: 0 }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label="最大数量"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="0.00000000"
              variant="outlined"
              inputProps={{ step: "any", min: 0 }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <DatePicker
              label="開始日"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              inputFormat="yyyy/MM/dd"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <DatePicker
              label="終了日"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              inputFormat="yyyy/MM/dd"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "検索"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default TransactionSearchForm;