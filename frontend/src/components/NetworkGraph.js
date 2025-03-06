import 'aframe';
import 'aframe-extras';
import React, { useRef, useCallback, useEffect } from "react";
import { Paper } from "@mui/material";
import { ForceGraph2D } from "react-force-graph";

const NetworkGraph = ({ 
  network, 
  blockchain,
  graphDimensions 
}) => {
  const fgRef = useRef();

  // ノードカラー設定
  const getNodeColor = useCallback((node) => {
    switch (node.type) {
      case "source":
        return "#e91e63"; // ソースノード（検索アドレス）は強調
      default:
        return "#90caf9"; // その他のアドレス
    }
  }, []);

  // リンクの色設定（トランザクション額に基づく）
  const getLinkColor = useCallback((link) => {
    // 金額に基づいて薄い青から濃い青へのグラデーション
    const minValue = 0;
    const maxValue = 10; // 適宜調整
    const normalizedValue = Math.min(
      Math.max((link.value - minValue) / (maxValue - minValue), 0),
      1
    );

    // 青のグラデーション
    return `rgba(0, 100, 255, ${0.2 + normalizedValue * 0.8})`;
  }, []);

  // リンクの幅設定
  const getLinkWidth = useCallback((link) => {
    // 金額に基づいてリンクの太さを決定
    const minWidth = 1;
    const maxWidth = 5;
    const minValue = 0;
    const maxValue = 10; // 適宜調整

    const normalizedValue = Math.min(
      Math.max((link.value - minValue) / (maxValue - minValue), 0),
      1
    );
    return minWidth + normalizedValue * (maxWidth - minWidth);
  }, []);

  // ノードクリックイベント
  const handleNodeClick = useCallback(
    (node) => {
      // ノードを中心に移動
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      if (fgRef.current) {
        fgRef.current.centerAt(node.x * distRatio, node.y * distRatio, 1000);
        fgRef.current.zoom(2, 1000);
      }
    },
    [fgRef]
  );

  // グラフ初期化後、中心ノードにフォーカス
  useEffect(() => {
    if (network && network.nodes && network.nodes.length > 0 && fgRef.current) {
      // 少し遅延を入れて確実にレンダリングが完了した後に実行
      const timer = setTimeout(() => {
        // 中心ノードを探す（タイプが "source" のノード）
        const sourceNode = network.nodes.find(node => node.type === "source");
        if (sourceNode && fgRef.current) {
          fgRef.current.centerAt(sourceNode.x || 0, sourceNode.y || 0, 1000);
          fgRef.current.zoom(1.5, 1000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [network]);

  return (
    <Paper
      sx={{
        width: "100%",
        height: graphDimensions.height,
        bgcolor: "#1a1a2e",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={network}
        nodeLabel="label"
        nodeColor={getNodeColor}
        nodeRelSize={7}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link) => getLinkWidth(link) * 0.6}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        linkLabel={(link) =>
          `${link.value.toFixed(8)} ${
            blockchain === "bitcoin" ? "BTC" : "ETH"
          }`
        }
        width={graphDimensions.width}
        height={graphDimensions.height}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // カスタムノード描画
          const label = node.label;
          const fontSize = 12/globalScale;
          const nodeSize = node.type === 'source' ? 8 : 5;
          
          // ノードの背景円を描画
          ctx.beginPath();
          ctx.fillStyle = getNodeColor(node);
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
          ctx.fill();
          
          // ノードのラベルを描画（必要に応じて）
          if (globalScale >= 1) {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(label.substring(0, 10) + '...', node.x, node.y + nodeSize + fontSize);
          }
        }}
        onEngineStop={() => {
          // グラフの描画が完了したら中心ノードにフォーカス
          if (network && network.nodes) {
            // 中心ノードを探す（タイプが "source" のノード）
            const sourceNode = network.nodes.find(
              (node) => node.type === "source"
            );
            if (sourceNode && fgRef.current) {
              fgRef.current.centerAt(
                sourceNode.x || 0,
                sourceNode.y || 0,
                1000
              );
              fgRef.current.zoom(1.5, 1000);
            }
          }
        }}
      />
    </Paper>
  );
};

export default NetworkGraph;
