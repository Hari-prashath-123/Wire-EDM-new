"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Play, Zap, BarChart3 } from "lucide-react"
import Header from "@/components/header"
import ParametersTab from "@/components/tabs/parameters-tab"
import dynamic from "next/dynamic"
const SimulationTab = dynamic(() => import("@/components/tabs/simulation-tab"), { ssr: false })
import AIModelsTab from "@/components/tabs/ai-models-tab"
import ResultsTab from "@/components/tabs/results-tab"
import { CuttingMethod } from "@/components/simulation/types"
import { trainSVM, trainANN, trainELM, trainGA, ModelResult } from "@/lib/aiModels"
import type { EDMParameters, ProcessMetrics } from "@/components/simulation/types"

// EDMParameters ported from the old project
// Parameters state now uses the strict EDMParameters shape

type Tab = "parameters" | "simulation" | "ai-models" | "results"


export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("parameters")
  const [selectedCuttingMethod, setSelectedCuttingMethod] = useState<CuttingMethod>("path-based")
  // Ported detailed EDMParameters state
  const [parameters, setParameters] = useState<EDMParameters>({
    voltage: 150,
    current: 25,
    pulseOnTime: 50,
    pulseOffTime: 100,
    wireSpeed: 250,
    dielectricFlow: 10,
    wireOffset: 2.5,
    sparkGap: 0.05,
    materialThickness: 10,
  })
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Steel')

  // Additional ported state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const [trainedModels, setTrainedModels] = useState<Record<string, ModelResult>>({})
  const [predictions, setPredictions] = useState<Record<string, any>>({})
  const [cuttingSpeed, setCuttingSpeed] = useState(1.0)
  const [cuttingMethod, setCuttingMethod] = useState<'wire' | 'path-based' | string>('wire')
  const [analyticsData, setAnalyticsData] = useState<Array<any>>([])

  const handleNextToSimulation = () => {
    setActiveTab("simulation")
  }

  // Ported processMetrics useMemo from old project
  // Deterministic metrics: avoid Math.random/Date.now during SSR by computing only from stable inputs.
  const processMetrics: ProcessMetrics = useMemo(() => {
    const dischargeEnergy = (parameters.voltage * parameters.current * parameters.pulseOnTime) / 1000
    const dutyCycle = (parameters.pulseOnTime / (parameters.pulseOnTime + parameters.pulseOffTime)) * 100
    const powerConsumption = (parameters.voltage * parameters.current) / 1000
    const estimatedCostPerHour = powerConsumption * 0.12 + 15 + (parameters.wireSpeed * 0.02)
    const materialRemovalRate = (dischargeEnergy * dutyCycle * parameters.current) / 100
    const surfaceRoughness = Math.max(0.1, 5 - (parameters.voltage / 100) + (parameters.pulseOnTime / 20))
    const wireWearRate = (parameters.current * parameters.voltage) / Math.max(parameters.wireSpeed * 100, 1)
    const efficiency = Math.min(100, (dutyCycle * parameters.dielectricFlow * parameters.wireSpeed) / 1000)
    return { dischargeEnergy, dutyCycle, powerConsumption, estimatedCostPerHour, materialRemovalRate, surfaceRoughness, wireWearRate, efficiency }
  }, [parameters])

  // Ported handlers
  const handleParameterChange = useCallback((key: keyof EDMParameters, value: number) => {
    setParameters(prev => {
      const next = { ...prev, [key]: value }
      const newPredictions: Record<string, any> = {}
      Object.entries(trainedModels).forEach(([m, model]) => {
        try { newPredictions[m] = model.predict(next) } catch {}
      })
      setPredictions(newPredictions)
      return next
    })
  }, [trainedModels])

  const handleToggleSimulation = () => {
    setIsSimulationRunning(prev => !prev);
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const handleTrainModel = async (modelType: string, data: any) => {
    let model: ModelResult | undefined;
    const { useRealData = true, uploadedData = null } = data || {};

    switch (modelType) {
      case 'SVM':
        model = await trainSVM(useRealData, uploadedData);
        break;
      case 'ANN':
        model = await trainANN(useRealData, undefined, uploadedData);
        break;
      case 'ELM':
        model = await trainELM(useRealData, uploadedData);
        break;
      case 'GA':
        model = await trainGA(useRealData, uploadedData);
        break;
      default:
        return;
    }

    if (!model) return;

    setTrainedModels(prev => ({ ...prev, [modelType]: model }));
    const prediction = model.predict(parameters)
    setPredictions(prev => ({ ...prev, [modelType]: prediction }))
  };

  // Ported analytics effect
  useEffect(() => {
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        // Use incremental deterministic pseudo-variation to minimize hydration mismatch risk.
        const count = analyticsData.length + 1
        const progress = (count * 7) % 100
        const variation = (seed: number, scale: number) => (((count * seed) % 17) - 8) * scale / 8
        const newDataPoint = {
          timestamp: Date.now(), // runs only client-side (effect)
          progress,
          materialRemovalRate: processMetrics.materialRemovalRate + variation(3, 2),
          powerConsumption: processMetrics.powerConsumption + variation(5, 0.5),
          surfaceRoughness: processMetrics.surfaceRoughness + variation(7, 0.2),
          temperature: 150 + 20 + variation(11, 80),
          efficiency: processMetrics.efficiency + variation(13, 10)
        }

        setAnalyticsData(prev => {
          const updated = [...prev, newDataPoint];
          return updated.slice(-50);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulationRunning, processMetrics, analyticsData.length]);

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Parameters</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="ai-models" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">AI Models</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="parameters" className="mt-6">
            <ParametersTab
              selectedMethod={selectedCuttingMethod}
              onCuttingMethodChange={setSelectedCuttingMethod}
              parameters={parameters}
              setParameters={setParameters}
              // ported handler and metrics
              onParameterChange={handleParameterChange}
              processMetrics={processMetrics}
              selectedMaterial={selectedMaterial}
              setSelectedMaterial={setSelectedMaterial}
              onNext={handleNextToSimulation}
            />
          </TabsContent>
          <TabsContent value="simulation" className="mt-6">
            <SimulationTab
              cuttingMethod={selectedCuttingMethod}
              parameters={parameters}
              setParameters={setParameters}
              material={selectedMaterial}
              // simulation state/handlers
              isRunning={isSimulationRunning}
              onToggleSimulation={handleToggleSimulation}
              onStopSimulation={handleStopSimulation}
              cuttingSpeed={cuttingSpeed}
              onCuttingSpeedChange={setCuttingSpeed}
            />
          </TabsContent>
          <TabsContent value="ai-models" className="mt-6">
            <AIModelsTab onTrainModel={handleTrainModel} trainedModels={trainedModels} />
          </TabsContent>
          <TabsContent value="results" className="mt-6">
            <ResultsTab predictions={trainedModels} parameters={parameters} processMetrics={processMetrics} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
