import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";

const NetworkInfo = ({ network, address, depth }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ネットワーク情報
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              ノード数
            </Typography>
            <Typography variant="body1">
              {network.nodes.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              取引数
            </Typography>
            <Typography variant="body1">
              {network.links.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              中心アドレス
            </Typography>
            <Typography
              variant="body2"
              sx={{
                wordBreak: "break-all",
                fontSize: "0.75rem",
              }}
            >
              {address}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              探索の深さ
            </Typography>
            <Typography variant="body1">{depth}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              凡例
            </Typography>
            <Stack direction="column" spacing={1} mt={1}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "#e91e63",
                    mr: 1,
                  }}
                />
                <Typography variant="body2">
                  中心アドレス
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: "#90caf9",
                    mr: 1,
                  }}
                />
                <Typography variant="body2">
                  関連アドレス
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NetworkInfo;
