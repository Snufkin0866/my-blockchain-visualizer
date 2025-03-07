import 'aframe';
import 'aframe-extras';
import React, { useRef, useCallback, useEffect } from "react";
import { Paper } from "@mui/material";
import { ForceGraph2D } from "react-force-graph";
import * as d3 from 'd3';

const NetworkGraph = ({ 
  network, 
  blockchain,
  graphDimensions,
  visualizationMode = 'center', // 'center' or 'tournament'
  graphContainerRef, // Add this prop
  onNodeClick, // Add callback for node click
  sourceAddress // Add source address for reference
}) => {
  const fgRef = useRef();

  // ノードカラー設定
  const getNodeColor = useCallback((node) => {
    switch (node.type) {
      case "source":
        return "#e91e63"; // ソースノード（検索アドレス）は強調
      case "focus":
        return "#ff9800"; // フォーカスされたノード（クリックされたアドレス）
      case "highlighted":
        return "#4caf50"; // ハイライトされたノード（ホバー中）
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

  // 現在フォーカスされているノードのID
  const [focusedNodeId, setFocusedNodeId] = React.useState(null);
  
  // ホバー中のノードのID
  const [hoveredNodeId, setHoveredNodeId] = React.useState(null);

  // ノードクリックイベント
  const handleNodeClick = useCallback(
    (node) => {
      console.log("NetworkGraph: Node clicked", node);
      console.log("NetworkGraph: Node coordinates", { x: node.x, y: node.y, z: node.z });
      console.log("NetworkGraph: onNodeClick prop exists:", !!onNodeClick);
      
      // ノードを中心に移動
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      if (fgRef.current) {
        console.log("NetworkGraph: Centering on node");
        fgRef.current.centerAt(node.x * distRatio, node.y * distRatio, 1000);
        fgRef.current.zoom(2, 1000);
      }
      
      // フォーカスノードを設定 (ソースノードも含めて全てのノードをフォーカス可能に)
      console.log("NetworkGraph: Setting focused node ID:", node.id);
      setFocusedNodeId(node.id);
      
      // 親コンポーネントにノードクリックイベントを通知
      // 必ず親コンポーネントに通知するように修正
      if (onNodeClick && typeof onNodeClick === 'function') {
        console.log("NetworkGraph: Calling parent onNodeClick callback");
        onNodeClick(node);
      }
    },
    [fgRef, onNodeClick]
  );
  
  // ノードホバーイベント
  const handleNodeHover = useCallback(node => {
    console.log("NetworkGraph: Node hover event:", node ? `Hovering over node ${node.id}` : "Hover ended");
    
    if (node) {
      setHoveredNodeId(node.id);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredNodeId(null);
      document.body.style.cursor = 'default';
    }
  }, []);

  // ノードの階層を計算する関数
  const calculateNodeHierarchy = useCallback((network, sourceId) => {
    const result = [];
    const visited = new Set();
    const queue = [{ id: sourceId, level: 0 }];
    const levelNodes = {};
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      
      // 現在のレベルのノードを記録
      if (!levelNodes[current.level]) levelNodes[current.level] = [];
      levelNodes[current.level].push(current.id);
      
      // 結果に追加
      result.push({
        id: current.id,
        level: current.level,
        indexInLevel: levelNodes[current.level].length - 1
      });
      
      // 隣接ノードを探索
      const links = network.links.filter(link => 
        link.source === current.id || 
        (typeof link.source === 'object' && link.source.id === current.id)
      );
      
      for (const link of links) {
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (!visited.has(targetId)) {
          queue.push({ id: targetId, level: current.level + 1 });
        }
      }
    }
    
    return result;
  }, []);

  // トーナメント形式のレイアウトを適用する関数
  const applyTournamentLayout = useCallback((network, sourceNode) => {
    // ノードの階層を計算
    const nodeHierarchy = calculateNodeHierarchy(network, sourceNode.id);
    
    // 各階層のノード数を計算
    const levelCounts = {};
    nodeHierarchy.forEach(node => {
      levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
    });
    
    // 最大階層を取得
    const maxLevel = Math.max(...Object.keys(levelCounts).map(Number));
    
    // 各ノードの位置を計算
    nodeHierarchy.forEach(hierarchyNode => {
      const node = network.nodes.find(n => n.id === hierarchyNode.id);
      if (node) {
        const level = hierarchyNode.level;
        const levelWidth = graphDimensions.width * 0.8;
        const levelHeight = graphDimensions.height * 0.8;
        
        // X座標: 階層に基づいて左から右へ配置
        const xPosition = (level / maxLevel) * levelWidth + (graphDimensions.width * 0.1);
        
        // Y座標: 同じ階層内で均等に分布
        const nodesInLevel = levelCounts[level];
        const indexInLevel = hierarchyNode.indexInLevel || 0;
        const yPosition = (indexInLevel / (nodesInLevel - 1 || 1)) * levelHeight + (graphDimensions.height * 0.1);
        
        // ノードの位置を固定
        node.fx = xPosition;
        node.fy = yPosition;
      }
    });
  }, [graphDimensions, calculateNodeHierarchy]);
  
  // グラフレイアウトの適用
  useEffect(() => {
    if (network && network.nodes && network.nodes.length > 0 && fgRef.current) {
      console.log("NetworkGraph: Applying graph layout, mode:", visualizationMode);
      console.log("NetworkGraph: Network nodes count:", network.nodes.length);
      
      // 少し遅延を入れて確実にレンダリングが完了した後に実行
      const timer = setTimeout(() => {
        // 中心ノードを探す（タイプが "source" のノード）
        const sourceNode = network.nodes.find(node => node.type === "source");
        console.log("NetworkGraph: Source node found:", sourceNode ? sourceNode.id : "none");
        
        // まず全てのノードの固定位置をリセット
        network.nodes.forEach(node => {
          node.fx = undefined;
          node.fy = undefined;
        });
        
        // フォースシミュレーションを完全にリセット
        fgRef.current.d3Force('charge', null);
        fgRef.current.d3Force('link', null);
        fgRef.current.d3Force('center', null);
        
        if (visualizationMode === 'tournament' && sourceNode) {
          console.log("NetworkGraph: Applying tournament layout");
          // トーナメント形式のレイアウトを適用
          applyTournamentLayout(network, sourceNode);
          
          // トーナメントモードでは物理シミュレーションを無効化
          // 固定位置のみを使用
          
          // 全体が見えるようにズームアウト
          fgRef.current.zoomToFit(400, 20);
        } else if (sourceNode && fgRef.current) {
          console.log("NetworkGraph: Applying center layout");
          // 中心形式のレイアウト（デフォルト）
          // フォースレイアウトを設定
          fgRef.current.d3Force('charge', d3.forceManyBody().strength(-100));
          fgRef.current.d3Force('link', d3.forceLink().id(d => d.id).distance(50));
          fgRef.current.d3Force('center', d3.forceCenter());
          
          // 初期位置をランダムに設定（ソースノードは中心）
          network.nodes.forEach(node => {
            if (node.type === 'source') {
              node.x = 0;
              node.y = 0;
            } else {
              node.x = (Math.random() - 0.5) * 100;
              node.y = (Math.random() - 0.5) * 100;
            }
          });
          
          // シミュレーションを再開
          fgRef.current.d3ReheatSimulation();
          
          // 中心ノードにフォーカス
          fgRef.current.centerAt(0, 0, 1000);
          fgRef.current.zoom(1.5, 1000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [network, visualizationMode, graphDimensions, applyTournamentLayout]);

  // ノードの描画サイズを取得する関数（クリック領域を広げるため）
  const getNodeSize = useCallback((node) => {
    const isSource = node.type === 'source';
    const isFocused = node.id === focusedNodeId;
    const isHovered = node.id === hoveredNodeId;
    
    // 基本サイズを大きくして、クリックしやすくする
    let nodeSize = isSource ? 10 : 8; // 基本サイズを大きくする (元は 8 と 5)
    if (isFocused) nodeSize = 12; // フォーカス時のサイズも大きくする (元は 9)
    else if (isHovered) nodeSize = 10; // ホバー時のサイズも大きくする (元は 7)
    
    return nodeSize;
  }, [focusedNodeId, hoveredNodeId]);

  // ノードの描画関数
  const drawNode = useCallback((node, ctx, globalScale) => {
    const label = node.label;
    const fontSize = 12/globalScale;
    
    // ノードサイズを決定（フォーカスノードは大きく）
    const isSource = node.type === 'source';
    const isFocused = node.id === focusedNodeId;
    const isHovered = node.id === hoveredNodeId;
    
    // ノードの描画時にログを出力（ただし頻度を抑えるため、特定の条件下でのみ）
    if (isHovered || isFocused) {
      console.log("NetworkGraph: Drawing node:", {
        id: node.id,
        isSource,
        isFocused,
        isHovered,
        position: { x: node.x, y: node.y }
      });
    }
    
    // getNodeSize関数を使用してサイズを取得
    const nodeSize = getNodeSize(node);
    
    // ノードの背景円を描画
    ctx.beginPath();
    
    // ノードの色を決定
    let fillColor;
    if (isFocused) fillColor = "#ff9800";
    else if (isHovered) fillColor = "#4caf50";
    else fillColor = getNodeColor(node);
    
    ctx.fillStyle = fillColor;
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
    ctx.fill();
    
    // フォーカスノードの場合、外側に輪郭を追加
    if (isFocused) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 2, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    // ホバー中のノードの場合も輪郭を追加
    if (isHovered && !isFocused) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeSize + 1, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "#81c784";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // ノードのラベルを描画（必要に応じて）
    if (globalScale >= 1 || isFocused) {
      ctx.font = `${isFocused ? fontSize * 1.2 : fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      
      // フォーカスノードの場合はラベルの背景を追加
      if (isFocused) {
        const textWidth = ctx.measureText(label.substring(0, 10) + '...').width;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(
          node.x - textWidth/2 - 2,
          node.y + nodeSize + fontSize - fontSize/2 - 1,
          textWidth + 4,
          fontSize + 2
        );
        ctx.fillStyle = '#ffffff';
      }
      
      ctx.fillText(
        label.substring(0, 10) + '...', 
        node.x, 
        node.y + nodeSize + fontSize
      );
    }
  }, [focusedNodeId, hoveredNodeId, getNodeColor, getNodeSize]);

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
        nodeColor={(node) => {
          // フォーカスされているノードを優先
          if (node.id === focusedNodeId) return "#ff9800";
          // ホバー中のノードを次に優先
          if (node.id === hoveredNodeId) return "#4caf50";
          // それ以外は通常の色
          return getNodeColor(node);
        }}
        nodeRelSize={10} // ノードの相対サイズを大きくする (元は 7)
        nodeVal={(node) => {
          // ノードの大きさを調整（フォーカスノードは大きく）
          if (node.id === focusedNodeId) return 1.5;
          if (node.id === hoveredNodeId) return 1.2;
          if (node.type === 'source') return 1.2;
          return 1;
        }}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link) => getLinkWidth(link) * 0.6}
        onNodeClick={(node) => {
          console.log("NetworkGraph: ForceGraph onNodeClick triggered for node:", node.id);
          handleNodeClick(node);
        }}
        onNodeHover={(node) => {
          console.log("NetworkGraph: ForceGraph onNodeHover triggered:", node ? node.id : "null");
          handleNodeHover(node);
        }}
        cooldownTicks={100}
        linkLabel={(link) =>
          `${link.value.toFixed(8)} ${
            blockchain === "bitcoin" ? "BTC" : "ETH"
          }`
        }
        width={graphDimensions.width}
        height={graphDimensions.height}
        nodeCanvasObject={drawNode}
        onEngineStop={() => {
          console.log("NetworkGraph: Engine stopped, adjusting view");
          // グラフの描画が完了したら適切なビューに調整
          if (network && network.nodes && fgRef.current) {
            if (visualizationMode === 'tournament') {
              // トーナメント形式の場合は全体が見えるようにズームアウト
              fgRef.current.zoomToFit(400, 20);
            } else {
              // 中心形式の場合は中心ノードにフォーカス
              const sourceNode = network.nodes.find(
                (node) => node.type === "source"
              );
              if (sourceNode) {
                fgRef.current.centerAt(
                  sourceNode.x || 0,
                  sourceNode.y || 0,
                  1000
                );
                fgRef.current.zoom(1.5, 1000);
              }
            }
          }
        }}
      />
    </Paper>
  );
};

export default NetworkGraph;
