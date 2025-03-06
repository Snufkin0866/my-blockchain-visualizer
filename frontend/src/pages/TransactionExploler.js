import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ja } from "date-fns/locale";

import { getTransactions } from "../services/api";

// インポートしたコンポーネント
import TransactionSearchForm from "../components/TransactionSearchForm";
import TransactionStats from "../components/TransactionStats";
import TransactionList from "../components/TransactionList";

const TransactionExplorer = () => {
  // 今月の1日を取得
  const firstDayOfCurrentMonth = new Date();
  firstDayOfCurrentMonth.setDate(1);

  // ステート管理
  const [blockchain, setBlockchain] = useState("bitcoin");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState(firstDayOfCurrentMonth); // 開始日を今月の1日に設定
  const [endDate, setEndDate] = useState(new Date()); // 終了日は今日のまま
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState(null);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // トランザクション検索
  const handleSearch = async () => {
    if (!address) {
      setError("ウォレットアドレスを入力してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getTransactions(
        blockchain,
        address,
        startDate,
        endDate
      );
      
      // 数量でフィルタリング
      let filteredData = data;
      if (minAmount !== "") {
        filteredData = filteredData.filter(tx => tx.value >= parseFloat(minAmount));
      }
      if (maxAmount !== "") {
        filteredData = filteredData.filter(tx => tx.value <= parseFloat(maxAmount));
      }

      setTransactions(filteredData);
      calculateStats(filteredData);
    } catch (err) {
      setError(
        err.response?.data?.detail || "データの取得中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  // 統計データの計算
  const calculateStats = (txs) => {
    if (!txs.length) {
      setStats(null);
      return;
    }

    // 送金と受領のトランザクションを分類（大文字小文字を区別せずに比較）
    const sent = txs.filter((tx) => tx.from_address.toLowerCase() === address.toLowerCase());
    const received = txs.filter((tx) => tx.to_address.toLowerCase() === address.toLowerCase());

    // 合計金額の計算
    const totalSent = sent.reduce((sum, tx) => sum + tx.value, 0);
    const totalReceived = received.reduce((sum, tx) => sum + tx.value, 0);

    // ユニークなアドレス数
    const uniqueSenders = new Set(received.map((tx) => tx.from_address)).size;
    const uniqueReceivers = new Set(sent.map((tx) => tx.to_address)).size;

    setStats({
      totalTransactions: txs.length,
      sentTransactions: sent.length,
      receivedTransactions: received.length,
      totalSent,
      totalReceived,
      balance: totalReceived - totalSent,
      uniqueSenders,
      uniqueReceivers,
      firstTx: new Date(Math.min(...txs.map((tx) => new Date(tx.timestamp)))),
      lastTx: new Date(Math.max(...txs.map((tx) => new Date(tx.timestamp)))),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={ja}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          トランザクション検索
        </Typography>

        <TransactionSearchForm 
          blockchain={blockchain}
          setBlockchain={setBlockchain}
          address={address}
          setAddress={setAddress}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          handleSearch={handleSearch}
          loading={loading}
          error={error}
        />

        {stats && (
          <TransactionStats stats={stats} blockchain={blockchain} />
        )}

        {transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            blockchain={blockchain}
            address={address}
          />
        ) : (
          !loading &&
          !error && (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1">
                ウォレットアドレスを入力して検索してください。
              </Typography>
            </Paper>
          )
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default TransactionExplorer;
