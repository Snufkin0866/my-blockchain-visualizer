import axios from "axios";
import { format } from "date-fns";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTransactions = async (
  blockchain,
  address,
  startDate,
  endDate
) => {
  try {
    let url = `/transactions/${blockchain}/${address}`;
    const params = {};

    if (startDate) {
      params.start_date = startDate.toISOString().split("T")[0];
    }

    if (endDate) {
      params.end_date = endDate.toISOString().split("T")[0];
    }

    const response = await api.get(url, { params });
    console.log("response:" + response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const getNetwork = async (
  blockchain,
  address,
  depth,
  startDate,
  endDate,
  minAmount
) => {
  console.log("API呼び出し開始:", {
    blockchain,
    address,
    depth,
    startDate,
    endDate,
  });

  try {
    const formattedStartDate = startDate
      ? format(new Date(startDate), "yyyy-MM-dd")
      : "";
    const formattedEndDate = endDate
      ? format(new Date(endDate), "yyyy-MM-dd")
      : "";

    const params = {
      depth,
      ...(formattedStartDate && { start_date: formattedStartDate }),
      ...(formattedEndDate && { end_date: formattedEndDate }),
      ...(minAmount && { min_amount: minAmount.toString() }),
    };

    console.log(
      "APIリクエストURL:",
      `${API_URL}/network/${blockchain}/${address}`
    );
    console.log("APIリクエストパラメータ:", params);

    const response = await api.get(
      `${API_URL}/network/${blockchain}/${address}`,
      { params }
    );
    console.log("API応答:", response.data);

    return response.data;
  } catch (error) {
    console.error("APIエラー:", error);
    console.error("エラー詳細:", error.response?.data || error.message);
    throw error;
  }
};
