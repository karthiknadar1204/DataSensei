export const AnalysisMessage = ({ response }) => {
  const content = response.data?.data?.content || response.data?.content || response.content;

  if (!content) {
    return null;
  }


  const details = Array.isArray(content.details) ? content.details : [content.details].filter(Boolean);

  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
      <div className="space-y-3">
        <p className="font-medium">{content.summary}</p>
        
        <ul className="list-disc pl-4 space-y-1">
          {details.map((detail, index) => (
            <li key={index} className="text-sm text-gray-700">{detail}</li>
          ))}
        </ul>

        {content.metrics && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="font-medium mb-2">Key Metrics:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(content.metrics).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-600">{key}:</span>{' '}
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 