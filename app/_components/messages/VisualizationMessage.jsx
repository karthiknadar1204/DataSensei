'use client'

import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import ScatterPlot from '../charts/ScatterPlot';

export const VisualizationMessage = ({ response }) => {
  // Handle nested data structures
  const data = response.data?.data || response.data;
  console.log("Data:", data);
  console.log("Response:", response);
  // console.log("response content",response.data.content)
  // console.log("response visualization",response.data.visualization.chartType)
  
  // Extract content and visualization data
  const content = data?.content;
  const chartType = data?.visualization?.chartType || data?.chartType;
  const chartData = data?.visualization?.data || data?.data;
  const config = data?.visualization?.config || data?.config;
  
  console.log("Extracted data:", { content, chartType, chartData, config });

  if (!chartType || !chartData) {
    console.error("Missing required visualization data", { response, data, chartType, chartData });
    return null;
  }

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      config: config,
      title: content?.title
    };

    switch (chartType.toLowerCase()) {
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'pie':
        return <PieChart {...chartProps} />;
      case 'line':
        return <LineChart {...chartProps} />;
      case 'scatter':
        return <ScatterPlot {...chartProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="prose dark:prose-invert">
        {content?.title && <h3>{content.title}</h3>}
        {content?.summary && <p>{content.summary}</p>}
        {content?.details && (
          <ul>
            {content.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        )}
        {content?.metrics && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(content.metrics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">{key}</div>
                <div className="text-lg font-semibold">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
        {renderChart()}
      </div>
    </div>
  );
};

export default VisualizationMessage; 