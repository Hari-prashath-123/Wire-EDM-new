/**
 * Taguchi Design of Experiments (DoE) and Statistical Analysis Module
 * Implements L9 Orthogonal Array, S/N Ratio, and ANOVA calculations
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface L9Experiment {
  experimentNumber: number;
  ton: number;
  toff: number;
  ip: number;
}

export interface L9Array {
  experiments: L9Experiment[];
  factors: {
    ton: number[];
    toff: number[];
    ip: number[];
  };
}

export interface ExperimentResult extends L9Experiment {
  surfaceRoughness: number;
  snRatio?: number;
}

export interface FactorEffect {
  factor: 'ton' | 'toff' | 'ip';
  level1Mean: number;
  level2Mean: number;
  level3Mean: number;
  effect: number; // Max - Min
}

export interface ANOVAResult {
  factor: 'ton' | 'toff' | 'ip';
  sumOfSquares: number;
  degreesOfFreedom: number;
  meanSquare: number;
  fValue?: number;
  percentageContribution: number;
}

export interface ANOVATable {
  factors: ANOVAResult[];
  error?: ANOVAResult;
  total: {
    sumOfSquares: number;
    degreesOfFreedom: number;
  };
}

// ============================================================================
// 1. Generate L9 Orthogonal Array
// ============================================================================

/**
 * Generates a standard Taguchi L9 orthogonal array for 3 factors at 3 levels
 * @param tonLevels - Array of 3 Pulse On Time levels (e.g., [100, 110, 120])
 * @param toffLevels - Array of 3 Pulse Off Time levels (e.g., [40, 50, 60])
 * @param ipLevels - Array of 3 Peak Current levels (e.g., [8, 10, 12])
 * @returns L9Array object containing 9 experiments with factor combinations
 */
export function generateL9Array(
  tonLevels: number[],
  toffLevels: number[],
  ipLevels: number[]
): L9Array {
  if (tonLevels.length !== 3 || toffLevels.length !== 3 || ipLevels.length !== 3) {
    throw new Error('Each factor must have exactly 3 levels for L9 array');
  }

  // Standard L9 Orthogonal Array Pattern
  // Each row represents [Ton Level Index, Toff Level Index, Ip Level Index]
  const l9Pattern = [
    [0, 0, 0], // Experiment 1: Level 1, Level 1, Level 1
    [0, 1, 1], // Experiment 2: Level 1, Level 2, Level 2
    [0, 2, 2], // Experiment 3: Level 1, Level 3, Level 3
    [1, 0, 1], // Experiment 4: Level 2, Level 1, Level 2
    [1, 1, 2], // Experiment 5: Level 2, Level 2, Level 3
    [1, 2, 0], // Experiment 6: Level 2, Level 3, Level 1
    [2, 0, 2], // Experiment 7: Level 3, Level 1, Level 3
    [2, 1, 0], // Experiment 8: Level 3, Level 2, Level 1
    [2, 2, 1], // Experiment 9: Level 3, Level 3, Level 2
  ];

  const experiments: L9Experiment[] = l9Pattern.map((pattern, index) => ({
    experimentNumber: index + 1,
    ton: tonLevels[pattern[0]],
    toff: toffLevels[pattern[1]],
    ip: ipLevels[pattern[2]],
  }));

  return {
    experiments,
    factors: {
      ton: tonLevels,
      toff: toffLevels,
      ip: ipLevels,
    },
  };
}

// ============================================================================
// 2. Calculate S/N Ratio (Smaller-the-Better)
// ============================================================================

/**
 * Calculates the Signal-to-Noise ratio using "smaller-the-better" formula
 * Used for surface roughness where lower values are better
 * Formula: S/N = -10 * log10(Σ(y²) / n)
 * @param roughnessValues - Array of surface roughness measurements
 * @returns S/N ratio in decibels (dB)
 */
export function calculateSNRatio(roughnessValues: number[]): number {
  if (roughnessValues.length === 0) {
    throw new Error('Roughness values array cannot be empty');
  }

  if (roughnessValues.some(val => val < 0)) {
    throw new Error('Roughness values must be non-negative');
  }

  const n = roughnessValues.length;
  const sumOfSquares = roughnessValues.reduce((sum, value) => sum + value ** 2, 0);
  const meanSquare = sumOfSquares / n;

  // Avoid log(0) which would result in -Infinity
  if (meanSquare === 0) {
    return Infinity; // Perfect case (no roughness)
  }

  const snRatio = -10 * Math.log10(meanSquare);
  return snRatio;
}

/**
 * Calculates S/N ratio for a single roughness value
 * @param roughnessValue - Single surface roughness measurement
 * @returns S/N ratio in decibels (dB)
 */
export function calculateSNRatioSingle(roughnessValue: number): number {
  return calculateSNRatio([roughnessValue]);
}

// ============================================================================
// 3. Calculate ANOVA (Analysis of Variance)
// ============================================================================

/**
 * Calculates ANOVA parameters for Taguchi L9 experimental results
 * Determines the effect and contribution of each factor (Ton, Toff, Ip) on Surface Roughness
 * @param experiments - Array of experiment results with factor levels and surface roughness
 * @returns ANOVATable containing Sum of Squares, DOF, Mean Square, and Percentage Contribution
 */
export function calculateANOVA(experiments: ExperimentResult[]): ANOVATable {
  if (experiments.length !== 9) {
    throw new Error('ANOVA calculation requires exactly 9 experiments for L9 array');
  }

  // Calculate grand mean
  const grandMean = experiments.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) / 9;

  // Calculate total sum of squares
  const totalSS = experiments.reduce(
    (sum, exp) => sum + (exp.surfaceRoughness - grandMean) ** 2,
    0
  );

  // Group experiments by factor levels
  const tonLevels = getUniqueSortedValues(experiments.map(e => e.ton));
  const toffLevels = getUniqueSortedValues(experiments.map(e => e.toff));
  const ipLevels = getUniqueSortedValues(experiments.map(e => e.ip));

  // Calculate factor effects and sum of squares
  const tonANOVA = calculateFactorANOVA('ton', tonLevels, experiments, totalSS);
  const toffANOVA = calculateFactorANOVA('toff', toffLevels, experiments, totalSS);
  const ipANOVA = calculateFactorANOVA('ip', ipLevels, experiments, totalSS);

  // Calculate error (if needed)
  const factorSS = tonANOVA.sumOfSquares + toffANOVA.sumOfSquares + ipANOVA.sumOfSquares;
  const errorSS = totalSS - factorSS;
  const errorDOF = 8 - tonANOVA.degreesOfFreedom - toffANOVA.degreesOfFreedom - ipANOVA.degreesOfFreedom;

  let error: ANOVAResult | undefined;
  if (errorDOF > 0) {
    error = {
      factor: 'ton', // placeholder
      sumOfSquares: errorSS,
      degreesOfFreedom: errorDOF,
      meanSquare: errorSS / errorDOF,
      percentageContribution: (errorSS / totalSS) * 100,
    };

    // Calculate F-values with error
    tonANOVA.fValue = tonANOVA.meanSquare / error.meanSquare;
    toffANOVA.fValue = toffANOVA.meanSquare / error.meanSquare;
    ipANOVA.fValue = ipANOVA.meanSquare / error.meanSquare;
  }

  return {
    factors: [tonANOVA, toffANOVA, ipANOVA],
    error,
    total: {
      sumOfSquares: totalSS,
      degreesOfFreedom: 8, // n - 1 = 9 - 1
    },
  };
}

/**
 * Helper function to calculate ANOVA parameters for a single factor
 */
function calculateFactorANOVA(
  factorName: 'ton' | 'toff' | 'ip',
  factorLevels: number[],
  experiments: ExperimentResult[],
  totalSS: number
): ANOVAResult {
  if (factorLevels.length !== 3) {
    throw new Error(`Factor ${factorName} must have exactly 3 levels`);
  }

  // Calculate mean response for each level
  const levelMeans = factorLevels.map(level => {
    const experimentsAtLevel = experiments.filter(exp => exp[factorName] === level);
    const meanRoughness = 
      experimentsAtLevel.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) / 
      experimentsAtLevel.length;
    return meanRoughness;
  });

  // Calculate grand mean
  const grandMean = experiments.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) / 9;

  // Calculate sum of squares for this factor
  // SS = Σ(ni * (Yi - Ym)²) where ni is number of experiments at level i
  const sumOfSquares = levelMeans.reduce((sum, levelMean) => {
    return sum + 3 * (levelMean - grandMean) ** 2; // 3 experiments per level in L9
  }, 0);

  // Degrees of freedom = number of levels - 1
  const degreesOfFreedom = factorLevels.length - 1; // 3 - 1 = 2

  // Mean square = SS / DOF
  const meanSquare = sumOfSquares / degreesOfFreedom;

  // Percentage contribution = (SS / Total SS) * 100
  const percentageContribution = (sumOfSquares / totalSS) * 100;

  return {
    factor: factorName,
    sumOfSquares,
    degreesOfFreedom,
    meanSquare,
    percentageContribution,
  };
}

/**
 * Helper function to get unique sorted values from an array
 */
function getUniqueSortedValues(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

// ============================================================================
// 4. Additional Helper Functions
// ============================================================================

/**
 * Calculates the main effects for each factor (difference between max and min level means)
 * @param experiments - Array of experiment results
 * @returns Array of factor effects
 */
export function calculateFactorEffects(experiments: ExperimentResult[]): FactorEffect[] {
  const tonLevels = getUniqueSortedValues(experiments.map(e => e.ton));
  const toffLevels = getUniqueSortedValues(experiments.map(e => e.toff));
  const ipLevels = getUniqueSortedValues(experiments.map(e => e.ip));

  const calculateEffect = (
    factorName: 'ton' | 'toff' | 'ip',
    levels: number[]
  ): FactorEffect => {
    const levelMeans = levels.map(level => {
      const experimentsAtLevel = experiments.filter(exp => exp[factorName] === level);
      return (
        experimentsAtLevel.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) /
        experimentsAtLevel.length
      );
    });

    const effect = Math.max(...levelMeans) - Math.min(...levelMeans);

    return {
      factor: factorName,
      level1Mean: levelMeans[0],
      level2Mean: levelMeans[1],
      level3Mean: levelMeans[2],
      effect,
    };
  };

  return [
    calculateEffect('ton', tonLevels),
    calculateEffect('toff', toffLevels),
    calculateEffect('ip', ipLevels),
  ];
}

/**
 * Calculates optimal factor levels (levels with minimum mean response for smaller-the-better)
 * @param experiments - Array of experiment results
 * @returns Optimal levels for each factor
 */
export function calculateOptimalLevels(experiments: ExperimentResult[]): {
  ton: number;
  toff: number;
  ip: number;
} {
  const findOptimalLevel = (factorName: 'ton' | 'toff' | 'ip'): number => {
    const levels = getUniqueSortedValues(experiments.map(e => e[factorName]));
    const levelMeans = levels.map(level => {
      const experimentsAtLevel = experiments.filter(exp => exp[factorName] === level);
      return {
        level,
        mean:
          experimentsAtLevel.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) /
          experimentsAtLevel.length,
      };
    });

    // Find level with minimum mean (smaller-the-better)
    const optimal = levelMeans.reduce((min, current) =>
      current.mean < min.mean ? current : min
    );

    return optimal.level;
  };

  return {
    ton: findOptimalLevel('ton'),
    toff: findOptimalLevel('toff'),
    ip: findOptimalLevel('ip'),
  };
}

/**
 * Predicts surface roughness using optimal factor levels
 * @param experiments - Array of experiment results
 * @param optimalLevels - Optimal levels for each factor (optional, will be calculated if not provided)
 * @returns Predicted surface roughness
 */
export function predictOptimalResponse(
  experiments: ExperimentResult[],
  optimalLevels?: { ton: number; toff: number; ip: number }
): number {
  const optimal = optimalLevels || calculateOptimalLevels(experiments);
  const grandMean = experiments.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) / 9;

  // Calculate contribution of each factor at optimal level
  const tonContribution = calculateLevelContribution('ton', optimal.ton, experiments, grandMean);
  const toffContribution = calculateLevelContribution('toff', optimal.toff, experiments, grandMean);
  const ipContribution = calculateLevelContribution('ip', optimal.ip, experiments, grandMean);

  // Predicted response = Grand Mean + Σ(Factor Contribution - Grand Mean)
  const predicted =
    grandMean +
    (tonContribution - grandMean) +
    (toffContribution - grandMean) +
    (ipContribution - grandMean);

  return predicted;
}

/**
 * Helper function to calculate contribution of a factor level
 */
function calculateLevelContribution(
  factorName: 'ton' | 'toff' | 'ip',
  level: number,
  experiments: ExperimentResult[],
  grandMean: number
): number {
  const experimentsAtLevel = experiments.filter(exp => exp[factorName] === level);
  const levelMean =
    experimentsAtLevel.reduce((sum, exp) => sum + exp.surfaceRoughness, 0) /
    experimentsAtLevel.length;
  return levelMean;
}
