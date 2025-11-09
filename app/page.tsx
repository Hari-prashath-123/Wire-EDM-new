"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Play, Zap, BarChart3 } from "lucide-react"
import Header from "@/components/header"
import ParametersTab from "@/components/tabs/parameters-tab"
import SimulationTab from "@/components/tabs/simulation-tab"
import AIModelsTab from "@/components/tabs/ai-models-tab"
import ResultsTab from "@/components/tabs/results-tab"
import { CuttingMethod, Parameters } from "@/components/simulation/types"

type Tab = "parameters" | "simulation" | "ai-models" | "results"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("parameters")
  const [cuttingMethod, setCuttingMethod] = useState<CuttingMethod>("path-based")
  const [parameters, setParameters] = useState<Parameters>({
    speed: 50,
    power: 60,
    precision: 70,
  })
  const [material, setMaterial] = useState<string>("Steel")

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
              cuttingMethod={cuttingMethod}
              setCuttingMethod={setCuttingMethod}
              parameters={parameters}
              setParameters={setParameters}
              material={material}
              setMaterial={setMaterial}
            />
          </TabsContent>
          <TabsContent value="simulation" className="mt-6">
            <SimulationTab cuttingMethod={cuttingMethod} />
          </TabsContent>
          <TabsContent value="ai-models" className="mt-6">
            <AIModelsTab />
          </TabsContent>
          <TabsContent value="results" className="mt-6">
            <ResultsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
