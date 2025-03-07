import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormLabel,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ja } from "date-fns/locale";
import { getNetwork, getTransactions, getTransactionsBetweenAddresses, getNetworkBetweenAddresses } from "../services/api";

// インポートしたコンポーネント
import SearchForm from "../components/SearchForm";
import NetworkInfo from "../components/NetworkInfo";
import NetworkGraph from "../components/NetworkGraph";
import TransactionList from "../components/TransactionList";

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
  const [visualizationMode, setVisualizationMode] = useState("center");
  
  // アドレス間トランザクション表示用のステート
  const [focusedNode, setFocusedNode] = useState(null);
  const [addressTransactions, setAddressTransactions] = useState([]);
  const [addressNetworkData, setAddressNetworkData] = useState(null);
  const [showingAddressTransactions, setShowingAddressTransactions] = useState(false);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(10);

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

  // コンポーネントマウント時にログ出力
  useEffect(() => {
    console.log("NetworkVisualization: Component mounted");
    console.log("NetworkVisualization: Initial graph dimensions:", graphDimensions);
  }, []);

  // ネットワークデータが変更されたときにログ出力
  useEffect(() => {
    console.log("NetworkVisualization: Network data updated:", network);
    if (network) {
      console.log("NetworkVisualization: Network nodes count:", network.nodes?.length);
      console.log("NetworkVisualization: Network links count:", network.links?.length);
    }
  }, [network]);

  // ノードクリック時の処理
  const handleNodeClick = async (node) => {
    console.log("NetworkVisualization: Node clicked:", node);
    console.log("NetworkVisualization: Node ID:", node.id);
    console.log("NetworkVisualization: Node type:", node.type);
    console.log("NetworkVisualization: Node label:", node.label);
    console.log("NetworkVisualization: Current loading state:", loading);
    console.log("NetworkVisualization: Current focused node:", focusedNode);
    
    // 既に同じノードがフォーカスされている場合は元の表示に戻す
    if (focusedNode && focusedNode.id === node.id) {
      console.log("NetworkVisualization: Same node clicked again, resetting focus");
      handleResetFocus();
      return;
    }
    
    // ローディング状態のチェックを削除し、常にノードクリックを処理できるようにする
    console.log("NetworkVisualization: Setting focused node:", node.id);
    setFocusedNode(node);
    setTransactionPage(0); // Reset pagination when a new node is clicked
    
    console.log("NetworkVisualization: Setting loading state to true");
    setLoading(true);
    
    try {
      // 1. アドレス間のトランザクションを取得
      console.log("NetworkVisualization: Fetching transactions between addresses:", blockchain, address, node.id);
      const transactions = await getTransactionsBetweenAddresses(
        blockchain,
        address,
        node.id,
        startDate,
        endDate
      );
      console.log("NetworkVisualization: Transactions fetched:", transactions.length);
      
      // 2. アドレス間のネットワークデータを取得
      console.log("NetworkVisualization: Fetching network data between addresses");
      const networkData = await getNetworkBetweenAddresses(
        blockchain,
        address,
        node.id,
        startDate,
        endDate,
        minAmount ? parseFloat(minAmount) : undefined
      );
      console.log("NetworkVisualization: Network data fetched:", networkData);
      
      // データ処理
      if (networkData && networkData.nodes && networkData.links) {
        console.log("NetworkVisualization: Processing network data");
        // IDを確実に文字列化
        const processedNodes = networkData.nodes.map((n) => ({
          ...n,
          id: String(n.id),
        }));
        
        const processedLinks = networkData.links.map((link) => ({
          ...link,
          id: String(link.id),
          source: String(link.source),
          target: String(link.target),
          value: typeof link.value === 'number' && !isNaN(link.value) ? link.value : 0
        }));
        
        const preparedData = {
          nodes: processedNodes,
          links: processedLinks,
        };
        
        console.log("NetworkVisualization: Setting address network data");
        setAddressNetworkData(preparedData);
        console.log("NetworkVisualization: Updating network display");
        setNetwork(preparedData);
      }
      
      console.log("NetworkVisualization: Setting address transactions");
      setAddressTransactions(transactions);
      console.log("NetworkVisualization: Showing address transactions");
      setShowingAddressTransactions(true);
    } catch (err) {
      console.error("NetworkVisualization: Error fetching address data:", err);
      setError("アドレス間のデータ取得中にエラーが発生しました: " + (err.message || String(err)));
    } finally {
      console.log("NetworkVisualization: Setting loading state to false");
      setLoading(false);
    }
  };
  
  // フォーカスをリセットして元のネットワーク表示に戻す
  const handleResetFocus = () => {
    console.log("NetworkVisualization: Resetting focus");
    setFocusedNode(null);
    setAddressTransactions([]);
    setAddressNetworkData(null);
    setShowingAddressTransactions(false);
    
    // 元のネットワークデータを表示
    if (networkData) {
      console.log("NetworkVisualization: Restoring original network data");
      setNetwork({...networkData});
    }
  };
  
  // ネットワークデータの取得
  const handleSearch = async () => {
    if (!address) {
      setError("ウォレットアドレスを入力してください");
      return;
    }

    console.log("NetworkVisualization: Starting search for address:", address);
    console.log("NetworkVisualization: Blockchain:", blockchain);
    console.log("NetworkVisualization: Depth:", depth);
    
    setLoading(true);
    setError(null);
    setNetwork(null); // 検索前にネットワークデータをリセット

    try {
      console.log('NetworkVisualization: Fetching network data...');
      
      // 本番用: APIからデータを取得
      const data = await getNetwork(
        blockchain,
        address,
        depth,
        startDate,
        endDate,
        minAmount ? parseFloat(minAmount) : undefined
      );
      
      console.log("NetworkVisualization: Raw data received:", data);

      // データ構造の検証と修正
      if (!data.nodes || !data.links || data.nodes.length === 0) {
        console.error("NetworkVisualization: Invalid network data received");
        setError("有効なネットワークデータが取得できませんでした");
        setLoading(false);
        return;
      }

      // IDを確実に文字列化（ForceGraphは文字列IDを期待する）
      const processedNodes = data.nodes.map((node) => ({
        ...node,
        id: String(node.id),
        // 初期位置は設定しない（NetworkGraphコンポーネントで設定する）
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

      console.log("NetworkVisualization: Processed data:", preparedData);
      console.log("NetworkVisualization: Setting network data");
      setNetwork(preparedData);
      setNetworkData(preparedData);
      
      // 初回可視化時にネットワーク内の全トランザクションを表示
      try {
        console.log("NetworkVisualization: Fetching all transactions for initial display");
        const allTransactions = await getTransactions(
          blockchain,
          address,
          startDate,
          endDate
        );
        console.log("NetworkVisualization: All transactions fetched:", allTransactions.length);
        
        // トランザクション表示用のステートを設定
        setAddressTransactions(allTransactions);
        setShowingAddressTransactions(true);
        
        // ソースノードをフォーカスとして設定（UI表示用）
        const sourceNode = preparedData.nodes.find(node => node.type === 'source');
        if (sourceNode) {
          console.log("NetworkVisualization: Setting source node as focus for UI:", sourceNode);
          setFocusedNode(sourceNode);
        }
      } catch (err) {
        console.error("NetworkVisualization: Error fetching all transactions:", err);
        setError("トランザクションデータの取得中にエラーが発生しました: " + (err.message || String(err)));
      }
    } catch (err) {
      console.error("NetworkVisualization: API call error:", err);
      setError(
        "データの取得中にエラーが発生しました: " + (err.message || String(err))
      );
    } finally {
      console.log("NetworkVisualization: Search completed, setting loading to false");
      setLoading(false);
    }
  };

  // エラーのみ全画面表示、ローディングは後でオーバーレイとして表示
  if (error) {
    console.error("NetworkVisualization: Rendering error state:", error);
    return <div>Error: {error.message}</div>;
  }

  console.log('NetworkVisualization: Rendering NetworkGraph with data:', network ? `${network.nodes?.length} nodes` : 'null');
  console.log('NetworkVisualization: Loading state:', loading);
  console.log('NetworkVisualization: Visualization mode:', visualizationMode);

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
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <TextField
                label="最小取引金額"
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                helperText={`${blockchain === "bitcoin" ? "BTC" : "ETH"}単位で入力してください`}
                sx={{ width: 200 }}
              />
            </Grid>
            <Grid item>
              <FormControl component="fieldset">
                <FormLabel component="legend">表示形式</FormLabel>
                <ToggleButtonGroup
                  value={visualizationMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode !== null) {
                      console.log("NetworkVisualization: Changing visualization mode to:", newMode);
                      // 表示モードを変更する際にネットワークデータを再設定して
                      // 完全にレイアウトをリセットする
                      setVisualizationMode(newMode);
                      if (networkData) {
                        // 一度nullにしてから再設定することで強制的に再レンダリング
                        setNetwork(null);
                        setTimeout(() => {
                          console.log("NetworkVisualization: Resetting network data for new visualization mode");
                          setNetwork({...networkData});
                        }, 50);
                      }
                    }
                  }}
                  aria-label="visualization mode"
                >
                  <ToggleButton value="center" aria-label="center mode">
                    中心配置
                  </ToggleButton>
                  <ToggleButton value="tournament" aria-label="tournament mode">
                    階層配置
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {network && network.nodes && network.nodes.length > 0 ? (
          <Box sx={{ mt: 4, position: "relative" }}>
            {/* ローディングオーバーレイ - ポインターイベントを修正 */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: loading ? "rgba(0, 0, 0, 0.5)" : "transparent",
                display: loading ? "flex" : "none",
                justifyContent: "center",
                alignItems: "center",
                zIndex: loading ? 10 : -1,
                borderRadius: 1,
                // 重要: ローディング中でもグラフのクリックイベントを通過させる
                pointerEvents: "none", // "auto" から "none" に変更
              }}
              onClick={() => {
                console.log("NetworkVisualization: Loading overlay clicked");
              }}
            >
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "rgba(25, 25, 50, 0.9)",
                  color: "white",
                  borderRadius: 2,
                  // ローディングインジケーターだけはクリック可能に
                  pointerEvents: "auto",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  データを読み込み中...
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3498db",
                    borderRadius: "50%",
                    animation: "spin 2s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </Paper>
            </Box>
            
            {showingAddressTransactions && (
              <Box sx={{ mb: 2 }}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: "#2c3e50", color: "white", borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={9}>
                      <Typography variant="h6" sx={{ 
                        color: "white", 
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        "& span": { fontWeight: "bold", color: "#4fc3f7" }
                      }}>
                        {focusedNode?.id === address ? (
                          // 初回表示時またはソースノードがクリックされた場合
                          <>ネットワーク内の全トランザクション</>
                        ) : (
                          // 他のノードがクリックされた場合
                          <><span>{address.substring(0, 10)}...{address.substring(address.length - 8)}</span> と <span>{focusedNode?.label.substring(0, 10)}...{focusedNode?.label.substring(focusedNode?.label.length - 8)}</span> の間のトランザクション</>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <ToggleButton
                        value="back"
                        selected={false}
                        onClick={() => {
                          console.log("NetworkVisualization: Reset focus button clicked");
                          handleResetFocus();
                        }}
                        sx={{ 
                          ml: { xs: 0, md: 2 },
                          bgcolor: "#4fc3f7", 
                          color: "#1a1a2e",
                          "&:hover": {
                            bgcolor: "#81d4fa"
                          }
                        }}
                      >
                        元の表示に戻る
                      </ToggleButton>
                    </Grid>
                  </Grid>
                </Paper>
                
                {addressTransactions.length > 0 ? (
                  <TransactionList
                    transactions={addressTransactions}
                    page={transactionPage}
                    setPage={setTransactionPage}
                    rowsPerPage={transactionRowsPerPage}
                    setRowsPerPage={setTransactionRowsPerPage}
                    blockchain={blockchain}
                    address={address}
                  />
                ) : (
                  <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
                    <Typography sx={{ color: "#546e7a", fontWeight: "medium", mb: 1 }}>
                      選択されたアドレス間のトランザクションはありません。
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#78909c" }}>
                      これらのアドレス間に直接的なトランザクションが存在しないか、指定された期間内にトランザクションがありません。
                      <br />
                      別のノードを選択するか、日付範囲を広げてみてください。
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <NetworkInfo 
                  network={network} 
                  address={address} 
                  depth={depth}
                  visualizationMode={visualizationMode}
                />
              </Grid>
              <Grid item xs={12} md={9} className="graph-container" ref={graphContainerRef}>
                {console.log("NetworkVisualization: Rendering NetworkGraph component")}
                <NetworkGraph
                  network={network}
                  blockchain={blockchain}
                  graphContainerRef={graphContainerRef}
                  graphDimensions={graphDimensions}
                  visualizationMode={visualizationMode}
                  onNodeClick={(node) => {
                    console.log("NetworkVisualization: onNodeClick callback triggered from NetworkGraph");
                    handleNodeClick(node);
                  }}
                  sourceAddress={address}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* 初期ロード時のローディングインジケーター */}
            {loading && (
              <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#1a1a2e", color: "white" }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  ネットワークデータを読み込み中...
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      border: "5px solid #f3f3f3",
                      borderTop: "5px solid #3498db",
                      borderRadius: "50%",
                      animation: "spin 1.5s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: "#90caf9" }}>
                  ブロックチェーンデータを取得しています。しばらくお待ちください...
                </Typography>
              </Paper>
            )}
            
            {/* 初期状態（データなし、ロードなし、エラーなし） */}
            {!loading && !error && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1">
                  アドレスを入力して検索すると、トランザクションネットワークが表示されます。
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default NetworkVisualization;
