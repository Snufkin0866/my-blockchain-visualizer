import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Info as InfoIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        このツールについて
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            概要
          </Typography>
          <Typography variant="body1" paragraph>
            このブロックチェーン可視化ツールは、ビットコインとイーサリアムの取引データを分析・可視化するためのウェブアプリケーションです。
            特定のウォレットアドレスを中心としたトランザクションの流れを調査し、時系列での変化やネットワーク構造を把握することができます。
          </Typography>
          <Typography variant="body1" paragraph>
            ブロックチェーン技術の透明性を活かし、パブリックな取引データをわかりやすく視覚化することで、
            調査・研究・分析のためのインサイトを提供します。
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            <SecurityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            プライバシーとデータの取り扱い
          </Typography>
          <Typography variant="body1" paragraph>
            このツールは、パブリックなブロックチェーンデータのみを使用しています。
            ユーザーが入力したアドレスや検索条件は、サーバーサイドでのデータ取得のためだけに使用され、
            第三者と共有されることはありません。
          </Typography>
          <Typography variant="body1" paragraph>
            キャッシュされたトランザクションデータは、パフォーマンス向上のために一時的に保存されますが、
            定期的に削除されます。
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            <CodeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            技術スタック
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary="フロントエンド"
                secondary="React, Material-UI, D3.js, React Force Graph"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary="バックエンド"
                secondary="Python, FastAPI, SQLAlchemy"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ApiIcon />
              </ListItemIcon>
              <ListItemText
                primary="外部API"
                secondary="BlockCypher API (Bitcoin), Etherscan API (Ethereum)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary="デプロイメント"
                secondary="Docker, Docker Compose"
              />
            </ListItem>
          </List>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          よくある質問
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              どのブロックチェーンに対応していますか？
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              現在はビットコイン（BTC）とイーサリアム（ETH）のメインネットに対応しています。
              今後、他のブロックチェーンにも対応する予定です。
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              トランザクションデータはどこから取得していますか？
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              ビットコインのデータはBlockCypher
              APIから、イーサリアムのデータはEtherscan APIから取得しています。
              これらのAPIはパブリックなブロックチェーンデータへのアクセスを提供しています。
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              ネットワーク図の解釈方法を教えてください
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              ネットワーク図では、ノード（点）がウォレットアドレスを、エッジ（線）がトランザクションを表しています。
              赤いノードは検索の中心となったアドレス、青いノードはそれと取引関係があるアドレスです。
              線の太さと色の濃さはトランザクションの金額に比例しており、より多くの価値が移動したトランザクションほど強調されます。
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              探索の深さとは何ですか？
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              探索の深さは、中心アドレスからどれだけ離れたトランザクションまで追跡するかを示します。
              深さ1では中心アドレスと直接取引のあるアドレスのみ、深さ2ではそれらのアドレスとさらに取引のあるアドレスまで、
              というように拡張されていきます。深さが増えるほど、より複雑なネットワークが表示されますが、
              データ取得と表示に時間がかかる場合があります。
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default About;
