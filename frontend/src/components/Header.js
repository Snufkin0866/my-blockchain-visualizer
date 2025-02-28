// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Box from "@mui/material/Box";

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <AccountBalanceWalletIcon sx={{ mr: 1 }} fontSize="large" />
          <Typography variant="h6">ブロックチェーン可視化ツール</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button color="inherit" component={Link} to="/">
            ダッシュボード
          </Button>
          <Button color="inherit" component={Link} to="/transactions">
            トランザクション
          </Button>
          <Button color="inherit" component={Link} to="/network">
            ネットワーク可視化
          </Button>
          <Button color="inherit" component={Link} to="/about">
            このツールについて
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
