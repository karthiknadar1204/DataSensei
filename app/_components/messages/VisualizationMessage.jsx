'use client'

import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import ScatterPlot from '../charts/ScatterPlot';

export const VisualizationMessage = ({ response }) => {

  const { content, visualization } = response.data?.data || response.data || response;

  if (!content || !visualization) {
    console.error("Missing required visualization data");
    return null;
  }

  const renderChart = (visualization) => {
    const { chartType, data, config } = visualization;
    
    const chartProps = {
      data: data,
      config: config,
      title: content.title
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
        <h3>{content.title}</h3>
        <p>{content.summary}</p>
        <ul>
          {content.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
        {content.metrics && (
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
        {renderChart(visualization)}
      </div>
    </div>
  );
};

export default VisualizationMessage; 