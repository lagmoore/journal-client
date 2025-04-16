// src/renderer/components/economy/EconomyChart.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EconomyChart = ({ data }) => {
  const { t } = useTranslation();

  // Get month names as abbreviations
  const getMonthAbbreviation = (monthName) => {
    return monthName.substring(0, 3);
  };

  // Format data for chart
  const chartData = data.map((month) => ({
    name: getMonthAbbreviation(month.monthName),
    [t("economy.fields.actualIncome")]: month.actualIncome,
    [t("economy.fields.budget")]: month.budget,
    [t("economy.fields.predictedIncome")]: month.predictedIncome,
  }));

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-100 p-3 border border-base-300 shadow-lg rounded">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span>
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("sv-SE", {
                style: "currency",
                currency: "SEK",
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(value)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey={t("economy.fields.actualIncome")}
            fill="#4CAF50" // Green for actual income
            name={t("economy.fields.actualIncome")}
          />
          <Bar
            dataKey={t("economy.fields.budget")}
            fill="#2196F3" // Blue for budget
            name={t("economy.fields.budget")}
          />
          <Bar
            dataKey={t("economy.fields.predictedIncome")}
            fill="#FF9800" // Orange for predicted income
            name={t("economy.fields.predictedIncome")}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EconomyChart;
