// @ts-nocheck
/* eslint-disable */

import * as tf from '@tensorflow/tfjs';
import type { EDMParameters } from "@/components/simulation/types";

// Helper to parse CSV text into an array of objects
function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: { [key: string]: number } = {};
    headers.forEach((header, index) => {
      obj[header] = parseFloat(values[index]) || 0;
    });
    return obj;
  });
}

// Fallback synthetic dataset generator when CSV is unavailable
function generateSyntheticData(rows: number = 200): any[] {
  const data: any[] = [];
  for (let i = 0; i < rows; i++) {
    // Inputs (approximate realistic ranges)
    const voltage = 90 + Math.random() * 210; // 90-300 V
    const current = 3 + Math.random() * 40;   // 3-43 A
    const pulseOnTime = 5 + Math.random() * 150; // 5-155 µs
    const pulseOffTime = 5 + Math.random() * 200; // 5-205 µs
    const wireTension = 4 + Math.random() * 12; // 4-16 (arbitrary units)
    const flushingPressure = 5 + Math.random() * 20; // 5-25 L/min equivalent
    const feedRate = 0.5 + Math.random() * 4; // 0.5-4.5 mm/s (proxy)
    const sparkGap = 0.02 + Math.random() * 0.18; // 0.02-0.2 mm

    // Simple synthetic relationships to outputs
    const energy = (voltage * current * pulseOnTime) / 1000;
    const duty = pulseOnTime / (pulseOnTime + pulseOffTime);
    const cooling = flushingPressure / 30;
    const tensionFactor = wireTension / 20;
    const gapPenalty = Math.max(0.5, 1 - (sparkGap - 0.05) * 2);

    const materialRemovalRate = Math.max(0.2, (energy * duty * (feedRate + 0.5)) / 8000 * gapPenalty);
    const surfaceRoughness = Math.max(0.1, 4.5 - (duty * 2) - (cooling * 1.2) + (sparkGap * 6) + (current / 60));
    const wireWearRate = Math.max(0.02, Math.min(1, (current * voltage) / 50000 * (1 - tensionFactor) * (1 - cooling + 0.3)));

    data.push({
      voltage,
      current,
      pulseOnTime,
      pulseOffTime,
      wireTension,
      flushingPressure,
      feedRate,
      sparkGap,
      materialRemovalRate,
      surfaceRoughness,
      wireWearRate
    });
  }
  return data;
}

// Fetch and parse the real dataset from the /public folder
async function loadEDMDataset(uploadedData?: any[]): Promise<any[]> {
  if (uploadedData && Array.isArray(uploadedData) && uploadedData.length > 0) {
    // Use uploaded data directly
    return uploadedData.map(d => ({
      voltage: d.voltage,
      current: d.current,
      pulseOnTime: d.pulseOnTime,
      pulseOffTime: d.pulseOffTime,
      wireTension: d.wireTension,
      flushingPressure: d.flushingPressure,
      feedRate: d.feedRate,
      sparkGap: d.sparkGap,
      materialRemovalRate: d.materialRemovalRate,
      surfaceRoughness: d.surfaceRoughness,
      wireWearRate: d.wireWearRate
    }));
  }
  try {
    const response = await fetch('/wire_edm_dataset.csv');
    if (!response.ok) {
      throw new Error("Failed to fetch dataset: " + response.statusText);
    }
    const csvText = await response.text();
    const data = parseCSV(csvText);
    if (!data || data.length === 0) {
      throw new Error("No valid data found in CSV file");
    }
    return data.map(d => ({
      voltage: d.voltage,
      current: d.current,
      pulseOnTime: d.pulseOnTime,
      pulseOffTime: d.pulseOffTime,
      wireTension: d.wireTension,
      flushingPressure: d.flushingPressure,
      feedRate: d.feedRate,
      sparkGap: d.sparkGap,
      materialRemovalRate: d.materialRemovalRate,
      surfaceRoughness: d.surfaceRoughness,
      wireWearRate: d.wireWearRate
    }));
  } catch (error) {
    console.warn("Error loading or parsing dataset, using synthetic data:", error);
    return generateSyntheticData();
  }
}

export interface ModelResult {
  accuracy: number;
  trainingTime: number;
  samples: number;
  rmse: number;
  predict: (params: EDMParameters) => {
    materialRemovalRate: number;
    surfaceRoughness: number;
    wireWearRate: number; // Changed from dimensionalAccuracy/processingTime
  };
  weights?: number[];
  modelData?: any;
}

// --- Normalization Helpers (updated for 8 inputs, 3 outputs) ---
// These denominators are estimations based on CSV data and param limits.
const INPUT_NORMS = [150, 15, 15, 60, 12, 12, 3, 0.1]; // V, A, POn, POff, T, P, F, G
const OUTPUT_NORMS = [4, 5, 1]; // MRR, SR, WWR

const normalizeInputs = (d: any): number[] => [
  (d.voltage || 100) / INPUT_NORMS[0],
  (d.current || 10) / INPUT_NORMS[1],
  (d.pulseOnTime || 10) / INPUT_NORMS[2],
  (d.pulseOffTime || 40) / INPUT_NORMS[3],
  (d.wireTension || 8) / INPUT_NORMS[4],         // New from CSV
  (d.flushingPressure || 9) / INPUT_NORMS[5], // New from CSV
  (d.feedRate || 2) / INPUT_NORMS[6],             // New from CSV
  (d.sparkGap || 0.05) / INPUT_NORMS[7]           // New from CSV
];

// Map EDMParameters (which is missing some CSV fields) to the 8-feature input array
const mapParamsToInputs = (params: EDMParameters): number[] => [
    (params.voltage || 100) / INPUT_NORMS[0],
    (params.current || 10) / INPUT_NORMS[1],
    (params.pulseOnTime || 10) / INPUT_NORMS[2],
    (params.pulseOffTime || 40) / INPUT_NORMS[3],
    (params.wireTension || 8) / INPUT_NORMS[4],         // DUMMY: param type doesn't have this
    (params.dielectricFlow || 9) / INPUT_NORMS[5], // Map dielectricFlow to flushingPressure
    (params.wireSpeed / 100 || 2) / INPUT_NORMS[6],   // Map wireSpeed to feedRate (adjust scale)
    (params.sparkGap || 0.05) / INPUT_NORMS[7]
];

const normalizeOutputs = (d: any): number[] => [
  d.materialRemovalRate / OUTPUT_NORMS[0],
  d.surfaceRoughness / OUTPUT_NORMS[1],
  d.wireWearRate / OUTPUT_NORMS[2]
];

const denormalizeOutputs = (result: number[]): { materialRemovalRate: number; surfaceRoughness: number; wireWearRate: number } => ({
  materialRemovalRate: Math.max(0.1, result[0] * OUTPUT_NORMS[0]),
  surfaceRoughness: Math.max(0.1, Math.min(5, result[1] * OUTPUT_NORMS[1])),
  wireWearRate: Math.max(0.01, Math.min(1, result[2] * OUTPUT_NORMS[2]))
});

// Support Vector Machine implementation
export async function trainSVM(useRealData: boolean = true, uploadedData?: any[]): Promise<ModelResult> {
  const startTime = Date.now();
  const data = useRealData ? await loadEDMDataset(uploadedData) : [];
  if (data.length === 0) throw new Error("No data loaded for SVM training.");
  
  console.log(`Training SVM with ${data.length} samples`);
  const features = data.map(normalizeInputs);
  const targets = data.map(normalizeOutputs); // 3 outputs

  const weights: number[][] = [];
  for (let output = 0; output < 3; output++) { // 3 outputs
    const y = targets.map((t: any) => t[output]);
    const w = solveLeastSquares(features, y); // 8 inputs + 1 bias = 9 weights
    weights.push(w);
  }
  
  let totalError = 0;
  for (let i = 0; i < data.length; i++) {
    const predicted = predictSVM(features[i], weights); // 3 outputs
    const actual = targets[i];
    for (let j = 0; j < 3; j++) { // 3 outputs
      totalError += Math.pow(predicted[j] - actual[j], 2);
    }
  }
  
  const rmse = Math.sqrt(totalError / (data.length * 3)); // 3 outputs
  const accuracy = Math.max(0, 1 - rmse); // Simplified accuracy
  
  const predict = (params: EDMParameters) => {
    const input = mapParamsToInputs(params);
    const result = predictSVM(input, weights);
    return denormalizeOutputs(result);
  };
  
  return {
    accuracy,
    trainingTime: Date.now() - startTime,
    samples: data.length,
    rmse,
    weights: weights.flat(),
    predict
  };
}

export interface ANNConfig {
  learningRate: number;
  epochs: number;
  hiddenUnits: number;
}

export async function trainANN(
  useRealData: boolean = true,
  config: ANNConfig = { learningRate: 0.01, epochs: 50, hiddenUnits: 12 },
  uploadedData?: any[]
): Promise<ModelResult> {
  const startTime = Date.now();
  const data = useRealData ? await loadEDMDataset(uploadedData) : [];
  if (data.length === 0) throw new Error("No data loaded for ANN training.");

  console.log(`Training ANN (TF.js) with ${data.length} samples`);
  const inputs = data.map(normalizeInputs);
  const targets = data.map(normalizeOutputs);
  
  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(targets);
  
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [8], units: config.hiddenUnits, activation: 'relu' })); // 8 inputs
  model.add(tf.layers.dense({ units: 3, activation: 'linear' })); // 3 outputs
  
  model.compile({ optimizer: tf.train.adam(config.learningRate), loss: 'meanSquaredError' });
  
  await model.fit(xs, ys, {
    epochs: config.epochs,
    batchSize: 8,
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch: number, logs: any) => {
        if (epoch % 10 === 0) {
          console.log(`Epoch ${epoch}, Loss: ${logs?.loss}`);
        }
      }
    }
  });
  
  const predsTensor = model.predict(xs) as tf.Tensor;
  const predsArr = await predsTensor.array() as number[][];
  let totalError = 0;
  for (let i = 0; i < predsArr.length; i++) {
    for (let j = 0; j < 3; j++) { // 3 outputs
      totalError += Math.pow(predsArr[i][j] - targets[i][j], 2);
    }
  }
  const rmse = Math.sqrt(totalError / (inputs.length * 3)); // 3 outputs
  const accuracy = Math.max(0, 1 - rmse);
  
  const predict = (params: EDMParameters) => {
    const input = mapParamsToInputs(params);
    const inputTensor = tf.tensor2d([input], [1, 8]); // 8 inputs
    const outputTensor = model.predict(inputTensor) as tf.Tensor;
    const result = outputTensor.dataSync();
    return denormalizeOutputs(Array.from(result));
  };
  
  return {
    accuracy,
    trainingTime: Date.now() - startTime,
    samples: data.length,
    rmse,
    predict
  };
}

export async function trainELM(useRealData: boolean = true, uploadedData?: any[]): Promise<ModelResult> {
  const startTime = Date.now();
  const data = useRealData ? await loadEDMDataset(uploadedData) : [];
  if (data.length === 0) throw new Error("No data loaded for ELM training.");

  console.log(`Training ELM with ${data.length} samples`);
  const inputSize = 8; // 8 inputs
  const hiddenSize = 20;
  const outputSize = 3; // 3 outputs
  
  const inputWeights = Array(hiddenSize).fill(0).map(() => Array(inputSize).fill(0).map(() => Math.random() * 2 - 1));
  const biases = Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
  
  const inputs = data.map(normalizeInputs);
  const targets = data.map(normalizeOutputs);

  const H: number[][] = [];
  for (let i = 0; i < inputs.length; i++) {
    const hiddenOutput: number[] = [];
    for (let j = 0; j < hiddenSize; j++) {
      let sum = biases[j];
      for (let k = 0; k < inputSize; k++) {
        sum += inputs[i][k] * inputWeights[j][k];
      }
      hiddenOutput.push(1 / (1 + Math.exp(-sum))); // sigmoid
    }
    H.push(hiddenOutput);
  }
  
  const HT = transpose(H);
  const HTH = matrixMultiply(HT, H);
  for (let i = 0; i < HTH.length; i++) {
    HTH[i][i] += 0.001; // Ridge regression
  }
  const HTHInv = matrixInverse(HTH);
  const HTHInvHT = matrixMultiply(HTHInv, HT);
  const outputWeights = matrixMultiply(HTHInvHT, targets); // [hiddenSize x outputSize]

  let totalError = 0;
  for (let i = 0; i < inputs.length; i++) {
    const predicted = predictELM(inputs[i], inputWeights, biases, outputWeights);
    const actual = targets[i];
    for (let j = 0; j < outputSize; j++) {
      totalError += Math.pow(predicted[j] - actual[j], 2);
    }
  }
  const rmse = Math.sqrt(totalError / (inputs.length * outputSize));
  const accuracy = Math.max(0, 1 - rmse);
  
  const predict = (params: EDMParameters) => {
    const input = mapParamsToInputs(params);
    const result = predictELM(input, inputWeights, biases, outputWeights);
    return denormalizeOutputs(result);
  };
  
  return {
    accuracy,
    trainingTime: Date.now() - startTime,
    samples: data.length,
    rmse,
    modelData: { inputWeights, biases, outputWeights },
    predict
  };
}

export async function trainGA(useRealData: boolean = true, uploadedData?: any[]): Promise<ModelResult> {
  const startTime = Date.now();
  const data = useRealData ? await loadEDMDataset(uploadedData) : [];
   if (data.length === 0) throw new Error("No data loaded for GA training.");

  console.log(`Training GA with ${data.length} samples`);
  const populationSize = 50;
  const generations = 100;
  const mutationRate = 0.1;
  const crossoverRate = 0.8;
  const inputSize = 8;
  const outputSize = 3;
  const chromosomeLength = (inputSize * outputSize) + outputSize; // 8 inputs * 3 outputs + 3 biases
  
  const inputs = data.map(normalizeInputs);
  const targets = data.map(normalizeOutputs);
  
  let population: number[][] = [];
  for (let i = 0; i < populationSize; i++) {
    const chromosome: number[] = [];
    for (let j = 0; j < chromosomeLength; j++) {
      chromosome.push(Math.random() * 2 - 1);
    }
    population.push(chromosome);
  }
  
  for (let gen = 0; gen < generations; gen++) {
    const fitness = population.map(chromosome => evaluateFitness(chromosome, inputs, targets, inputSize, outputSize));
    const newPopulation: number[][] = [];
    const sortedIndices = fitness.map((f, i) => ({ fitness: f, index: i })).sort((a, b) => b.fitness - a.fitness);
    
    const eliteCount = Math.floor(populationSize * 0.1);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push([...population[sortedIndices[i].index]]);
    }
    
    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelection(population, fitness);
      const parent2 = tournamentSelection(population, fitness);
      let [child1, child2] = crossover(parent1, parent2, crossoverRate);
      child1 = mutate(child1, mutationRate);
      child2 = mutate(child2, mutationRate);
      newPopulation.push(child1);
      if (newPopulation.length < populationSize) {
        newPopulation.push(child2);
      }
    }
    population = newPopulation;
    // if (gen % 20 === 0) {
    //   const bestFitness = Math.max(...fitness);
    //   console.log(`Generation ${gen}, Best Fitness: ${bestFitness}`);
    // }
  }
  
  const finalFitness = population.map(chromosome => evaluateFitness(chromosome, inputs, targets, inputSize, outputSize));
  const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
  const bestChromosome = population[bestIndex];
  
  const accuracy = finalFitness[bestIndex];
  const rmse = Math.sqrt(1 / accuracy - 1); // Inverse of fitness function
  
  const predict = (params: EDMParameters) => {
    const input = mapParamsToInputs(params);
    const result = predictGA(input, bestChromosome, inputSize, outputSize);
    return denormalizeOutputs(result);
  };
  
  return {
    accuracy,
    trainingTime: Date.now() - startTime,
    samples: data.length,
    rmse,
    weights: bestChromosome,
    predict
  };
}

// --- MATRIX/MATH HELPERS ---

function solveLeastSquares(X: number[][], y: number[]): number[] {
  // Add bias term
  const XWithBias = X.map(row => [1, ...row]);
  // Use manual least squares: (X^T * X)^-1 * X^T * y
  const xt = transpose(XWithBias);
  const xtx = matrixMultiply(xt, XWithBias);
  const xty = matrixVectorMultiply(xt, y);
  // Use manual matrix inversion and Gaussian elimination
  const xtxInv = matrixInverse(xtx);
  // Multiply xtxInv * xty
  const weights = matrixVectorMultiply(xtxInv, xty);
  return weights;
}

function predictSVM(input: number[], weights: number[][]): number[] {
  const inputWithBias = [1, ...input]; // 9 features
  return weights.map(w => { // w is [9 x 1]
    let sum = 0;
    for (let i = 0; i < inputWithBias.length; i++) {
      sum += inputWithBias[i] * (w[i] || 0); // w[i]
    }
    return sum;
  });
}

function predictELM(input: number[], inputWeights: number[][], biases: number[], outputWeights: number[][]): number[] {
  const hiddenSize = inputWeights.length;
  const inputSize = input.length;
  const outputSize = outputWeights[0].length; // outputWeights is [hiddenSize x outputSize]
  
  const hiddenOutput: number[] = [];
  for (let i = 0; i < hiddenSize; i++) {
    let sum = biases[i];
    for (let j = 0; j < inputSize; j++) {
      sum += input[j] * inputWeights[i][j];
    }
    hiddenOutput.push(1 / (1 + Math.exp(-sum))); // sigmoid
  }
  
  const output: number[] = [];
  for (let i = 0; i < outputSize; i++) {
    let sum = 0;
    for (let j = 0; j < hiddenSize; j++) {
      sum += hiddenOutput[j] * outputWeights[j][i]; // Corrected indexing
    }
    output.push(sum);
  }
  return output;
}

function evaluateFitness(chromosome: number[], inputs: number[][], targets: number[][], inputSize: number, outputSize: number): number {
  let totalError = 0;
  for (let i = 0; i < inputs.length; i++) {
    const predicted = predictGA(inputs[i], chromosome, inputSize, outputSize);
    const actual = targets[i];
    for (let j = 0; j < outputSize; j++) {
      totalError += Math.pow(predicted[j] - actual[j], 2);
    }
  }
  const mse = totalError / (inputs.length * outputSize);
  return 1 / (1 + mse); // Fitness is inverse of MSE
}

function predictGA(input: number[], chromosome: number[], inputSize: number, outputSize: number): number[] {
  const output: number[] = [];
  const biasStart = inputSize * outputSize;
  
  for (let i = 0; i < outputSize; i++) {
    let sum = chromosome[biasStart + i]; // Get bias for this output
    for (let j = 0; j < inputSize; j++) {
      sum += input[j] * chromosome[i * inputSize + j]; // Get weight for input j -> output i
    }
    output.push(Math.tanh(sum)); // Use tanh activation
  }
  return output;
}

function tournamentSelection(population: number[][], fitness: number[], tournamentSize: number = 3): number[] {
  let best = Math.floor(Math.random() * population.length);
  for (let i = 1; i < tournamentSize; i++) {
    const competitor = Math.floor(Math.random() * population.length);
    if (fitness[competitor] > fitness[best]) {
      best = competitor;
    }
  }
  return [...population[best]];
}

function crossover(parent1: number[], parent2: number[], crossoverRate: number): [number[], number[]] {
  if (Math.random() > crossoverRate) {
    return [[...parent1], [...parent2]];
  }
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
  const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)];
  return [child1, child2];
}

function mutate(chromosome: number[], mutationRate: number): number[] {
  return chromosome.map(gene => {
    if (Math.random() < mutationRate) {
      return gene + (Math.random() - 0.5) * 0.2; // Gaussian mutation
    }
    return gene;
  });
}

function transpose(matrix: number[][]): number[][] {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    return [];
  }
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const aRows = a.length, aCols = a[0].length, bRows = b.length, bCols = b[0].length;
  if (aCols !== bRows) {
    throw new Error("Matrix dimensions incompatible for multiplication");
  }
  const result: number[][] = Array(aRows).fill(0).map(() => Array(bCols).fill(0));
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map(row => row.reduce((sum, val, i) => sum + val * vector[i], 0));
}

function matrixInverse(matrix: number[][]): number[][] {
  // This is a simple implementation for small matrices, not robust for all cases
  const n = matrix.length;
  const identity = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((_, j) => i === j ? 1 : 0));
  const augmented = matrix.map((row, i) => [...row, ...identity[i]]);
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    let pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) {
      pivot = 1e-10; // Avoid division by zero
    }
    
    for (let j = i; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = i; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  return augmented.map(row => row.slice(n));
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    let pivot = augmented[i][i];
     if (Math.abs(pivot) < 1e-10) {
      pivot = 1e-10; // Avoid division by zero
    }
    
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / pivot;
      for (let j = i; j < n + 1; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= (augmented[i][i] || 1e-10); // Avoid division by zero
  }
  return x;
}