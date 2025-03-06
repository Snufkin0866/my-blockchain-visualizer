import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ja } from "date-fns/locale";
import { getNetwork } from "../services/api";

// インポートしたコンポーネント
import SearchForm from "../components/SearchForm";
import NetworkInfo from "../components/NetworkInfo";
import NetworkGraph from "../components/NetworkGraph";

const NetworkVisualization = () => {
  // 今月の1日を取得
  const firstDayOfCurrentMonth = new Date();
  firstDayOfCurrentMonth.setDate(1);

  // ステート管理
  const [blockchain, setBlockchain] = useState("bitcoin");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState(firstDayOfCurrentMonth);
  const [endDate, setEndDate] = useState(new Date());
  const [depth, setDepth] = useState(1);
  const [minAmount, setMinAmount] = useState("");
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkData, setNetworkData] = useState(null);

  // グラフコンテナの参照
  const graphContainerRef = useRef();

  // グラフサイズ監視
  const [graphDimensions, setGraphDimensions] = useState({
    width: window.innerWidth * 0.65,
    height: 600,
  });

  // ウィンドウサイズ変更を監視してグラフサイズを調整
  useEffect(() => {
    const handleResize = () => {
      if (graphContainerRef.current) {
        const containerWidth = graphContainerRef.current.clientWidth;
        setGraphDimensions({
          width: containerWidth || window.innerWidth * 0.65,
          height: Math.min(700, Math.max(500, window.innerHeight * 0.6)),
        });
      }
    };

    window.addEventListener("resize", handleResize);
    // 初期化時にも実行
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ネットワークデータの取得
  const handleSearch = async () => {
    if (!address) {
      setError("ウォレットアドレスを入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setNetwork(null); // 検索前にネットワークデータをリセット

    try {
      console.log('Fetching network data...');
      const data = await getNetwork(
        blockchain,
        address,
        depth,
        startDate,
        endDate,
        minAmount ? parseFloat(minAmount) : undefined
      );
      console.log("取得データ:", data);

      // データ構造の検証と修正
      if (!data.nodes || !data.links || data.nodes.length === 0) {
        setError("有効なネットワークデータが取得できませんでした");
        setLoading(false);
        return;
      }

      // IDを確実に文字列化（ForceGraphは文字列IDを期待する）
      const processedNodes = data.nodes.map((node) => ({
        ...node,
        id: String(node.id),
        // ノードタイプに基づいて初期配置を設定
        x: node.type === "source" ? 0 : Math.random() * 100 - 50,
        y: node.type === "source" ? 0 : Math.random() * 100 - 50,
      }));      
      // リンクのsourceとtargetが確実に文字列IDを参照するよう修正
      const processedLinks = data.links.map((link) => ({
        ...link,
        id: String(link.id),
        source: String(link.source),
        target: String(link.target),
        // リンクの値が数値であることを確認（NaNを防止）
        value: typeof link.value === 'number' && !isNaN(link.value) ? link.value : 0
      }));

      // 処理済みデータをセット
      const preparedData = {
        nodes: processedNodes,
        links: processedLinks,
      };

      console.log("処理済みデータ:", preparedData);
      setNetwork(preparedData);
      setNetworkData(preparedData);
    } catch (err) {
      setError(
        "データの取得中にエラーが発生しました: " + (err.message || String(err))
      );
      console.error("API呼び出しエラー:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log('Rendering NetworkGraph with data:', networkData);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={ja}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ネットワーク可視化
        </Typography>

        <SearchForm
          blockchain={blockchain}
          setBlockchain={setBlockchain}
          address={address}
          setAddress={setAddress}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          depth={depth}
          setDepth={setDepth}
          handleSearch={handleSearch}
          loading={loading}
          error={error}
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <TextField
            label="最小取引金額"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            helperText={`${blockchain === "bitcoin" ? "BTC" : "ETH"}単位で入力してください`}
            sx={{ width: 200 }}
          />
        </Box>

        {network && network.nodes && network.nodes.length > 0 ? (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <NetworkInfo 
                  network={network} 
                  address={address} 
                  depth={depth} 
                />
              </Grid>
              <Grid item xs={12} md={9} className="graph-container" ref={graphContainerRef}>
                <NetworkGraph
                  network={network}
                  blockchain={blockchain}
                  graphContainerRef={graphContainerRef}
                  graphDimensions={graphDimensions}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          !loading &&
          !error && (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1">
                アドレスを入力して検索すると、トランザクションネットワークが表示されます。
              </Typography>
            </Paper>
          )
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default NetworkVisualization;
