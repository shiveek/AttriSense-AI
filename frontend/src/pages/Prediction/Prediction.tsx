import MainLayout from "../../components/layout/MainLayout";
import PredictionForm from "../../components/Prediction/PredictionForm";

const Prediction = () => {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Employee Attrition Prediction
        </h1>

        <p className="text-gray-500 mt-2">
          Enter employee information to predict attrition risk using AI.
        </p>
      </div>

      <PredictionForm />
    </MainLayout>
  );
};

export default Prediction;