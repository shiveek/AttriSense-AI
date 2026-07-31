interface PredictionResultProps {
  probability: number;
  risk: string;
  confidence: number;
}

const PredictionResult = ({
  probability,
  risk,
  confidence,
}: PredictionResultProps) => {
  const riskColor =
    risk === "High"
      ? "text-red-600"
      : risk === "Medium"
      ? "text-yellow-600"
      : "text-green-600";

  const progressColor =
    risk === "High"
      ? "bg-red-500"
      : risk === "Medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Prediction Result
      </h2>

      <h3 className={`text-3xl font-bold mb-6 ${riskColor}`}>
        {risk.toUpperCase()} ATTRITION RISK
      </h3>

      <div className="mb-6">
        <p className="font-semibold mb-2">
          Probability
        </p>

        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${progressColor} h-5`}
            style={{ width: `${probability}%` }}
          />
        </div>

        <p className="mt-2 font-semibold">
          {probability}%
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-blue-50 rounded-lg p-5">
          <p className="text-gray-500">
            Confidence
          </p>

          <h3 className="text-3xl font-bold text-blue-600">
            {confidence}%
          </h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-gray-500">
            Risk Level
          </p>

          <h3 className={`text-3xl font-bold ${riskColor}`}>
            {risk}
          </h3>
        </div>

      </div>
    </div>
  );
};

export default PredictionResult;