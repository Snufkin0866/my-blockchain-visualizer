import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Chip,
} from "@mui/material";
import { formatDistance } from "date-fns";
import { ja } from "date-fns/locale";

const TransactionList = ({
  transactions,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  blockchain,
  address,
}) => {
  // ページネーションのハンドラー
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (transactions.length === 0) return null;

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        トランザクション履歴
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>タイムスタンプ</TableCell>
                <TableCell>取引ID</TableCell>
                <TableCell>送信元</TableCell>
                <TableCell>送信先</TableCell>
                <TableCell align="right">金額</TableCell>
                <TableCell>コントラクト情報</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => (
                  <TableRow key={tx.txid}>
                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Typography variant="body2">
                          {new Date(tx.timestamp).toLocaleString("ja-JP")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistance(
                            new Date(tx.timestamp),
                            new Date(),
                            { addSuffix: true, locale: ja }
                          )}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tx.txid}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        color={
                          tx.from_address === address
                            ? "primary"
                            : "text.primary"
                        }
                      >
                        {tx.from_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        color={
                          tx.to_address === address ? "primary" : "text.primary"
                        }
                      >
                        {tx.to_address}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Typography variant="body2">
                          {tx.value.toFixed(8)}
                        </Typography>
                        <Chip
                          size="small"
                          label={blockchain === "bitcoin" ? "BTC" : "ETH"}
                          color="secondary"
                          variant="outlined"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {tx.is_contract_interaction && (
                        <Stack direction="column" spacing={0.5}>
                          <Typography variant="body2" color="primary">
                            スマートコントラクト
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            アドレス: {tx.contract_address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            メソッド: {tx.contract_method}
                          </Typography>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="表示件数:"
        />
      </Paper>
    </Box>
  );
};

export default TransactionList;