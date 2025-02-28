import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import {
  Wallet as WalletIcon,
  Timeline as TimelineIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ブロックチェーン取引可視化ツール
      </Typography>

      <Typography variant="body1" paragraph>
        このツールは、ビットコインとイーサリアムの取引を可視化し、アドレス間の送金フローを分析するためのインターフェースを提供します。
        特定の期間を指定してトランザクションネットワークを調査できます。
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          機能一覧
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <WalletIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" component="h3">
                    トランザクション検索
                  </Typography>
                </Box>
                <Typography variant="body2">
                  アドレスを入力し、特定の期間のトランザクション履歴を取得します。
                  送金元と送金先、金額、日時などの詳細情報を確認できます。
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/transactions"
                  size="small"
                  color="primary"
                >
                  詳細を見る
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AccountTreeIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" component="h3">
                    ネットワーク可視化
                  </Typography>
                </Box>
                <Typography variant="body2">
                  特定のアドレスを中心としたトランザクションネットワークを可視化します。
                  資金の流れやアドレス間の関連性を視覚的に把握できます。
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/network"
                  size="small"
                  color="primary"
                >
                  詳細を見る
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" component="h3">
                    時系列分析
                  </Typography>
                </Box>
                <Typography variant="body2">
                  時間軸に沿ったトランザクションの変化を分析します。
                  期間を指定して、データの推移や特定のパターンを検出できます。
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to="/transactions"
                >
                  詳細を見る
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            はじめに
          </Typography>

          <Typography variant="body1" paragraph>
            ブロックチェーン上の取引を調査するには、まず分析したいウォレットアドレスを入力してください。
            現在、ビットコインとイーサリアムに対応しています。
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}
          >
            <Button
              variant="contained"
              component={RouterLink}
              to="/transactions"
              startIcon={<WalletIcon />}
            >
              トランザクション検索を開始
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/network"
              startIcon={<AccountTreeIcon />}
            >
              ネットワーク可視化を開始
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
