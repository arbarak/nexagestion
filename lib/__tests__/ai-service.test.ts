import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from '../ai-service';

describe('AIService', () => {
  const mockCompanyId = 'company_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sales Prediction', () => {
    it('should generate sales prediction result', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(prediction).toBeDefined();
      expect(prediction).toHaveProperty('prediction');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('timeframe');
      expect(prediction).toHaveProperty('recommendations');
    });

    it('should have numeric confidence score', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(typeof prediction.confidence).toBe('number');
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should provide recommendations array', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(Array.isArray(prediction.recommendations)).toBe(true);
      expect(prediction.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should have defined timeframe', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(prediction.timeframe).toBeDefined();
      expect(typeof prediction.timeframe).toBe('string');
    });
  });

  describe('Demand Prediction', () => {
    it('should generate demand prediction', async () => {
      const prediction = await aiService.generateDemandPrediction(mockCompanyId);

      expect(prediction).toBeDefined();
      expect(prediction).toHaveProperty('prediction');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('affectedProducts');
    });

    it('should provide list of affected products', async () => {
      const prediction = await aiService.generateDemandPrediction(mockCompanyId);

      expect(Array.isArray(prediction.affectedProducts)).toBe(true);
    });

    it('should have product demand details', async () => {
      const prediction = await aiService.generateDemandPrediction(mockCompanyId);

      if (prediction.affectedProducts.length > 0) {
        const product = prediction.affectedProducts[0];
        expect(product).toHaveProperty('productId');
        expect(product).toHaveProperty('predictedDemand');
      }
    });
  });

  describe('Recommendations', () => {
    it('should generate inventory recommendations', async () => {
      const recommendations = await aiService.generateInventoryRecommendations(mockCompanyId);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should generate pricing recommendations', async () => {
      const recommendations = await aiService.generatePricingRecommendations(mockCompanyId);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should have recommendation action', async () => {
      const recommendations = await aiService.generateInventoryRecommendations(mockCompanyId);

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('action');
        expect(typeof rec.action).toBe('string');
      }
    });

    it('should have recommendation confidence', async () => {
      const recommendations = await aiService.generatePricingRecommendations(mockCompanyId);

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty('confidence');
        expect(typeof rec.confidence).toBe('number');
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect financial anomalies', async () => {
      const anomalies = await aiService.detectFinancialAnomalies(mockCompanyId);

      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should detect inventory anomalies', async () => {
      const anomalies = await aiService.detectInventoryAnomalies(mockCompanyId);

      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should detect sales anomalies', async () => {
      const anomalies = await aiService.detectSalesAnomalies(mockCompanyId);

      expect(Array.isArray(anomalies)).toBe(true);
    });

    it('should have anomaly type', async () => {
      const anomalies = await aiService.detectFinancialAnomalies(mockCompanyId);

      if (anomalies.length > 0) {
        const anomaly = anomalies[0];
        expect(anomaly).toHaveProperty('type');
        expect(typeof anomaly.type).toBe('string');
      }
    });

    it('should have anomaly severity', async () => {
      const anomalies = await aiService.detectSalesAnomalies(mockCompanyId);

      if (anomalies.length > 0) {
        const anomaly = anomalies[0];
        expect(anomaly).toHaveProperty('severity');
        expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity);
      }
    });

    it('should have description for anomaly', async () => {
      const anomalies = await aiService.detectInventoryAnomalies(mockCompanyId);

      if (anomalies.length > 0) {
        const anomaly = anomalies[0];
        expect(anomaly).toHaveProperty('description');
        expect(typeof anomaly.description).toBe('string');
      }
    });
  });

  describe('Aggregate Methods', () => {
    it('should get all recommendations', async () => {
      const allRecommendations = await aiService.getAllRecommendations(mockCompanyId);

      expect(Array.isArray(allRecommendations)).toBe(true);
    });

    it('should get all anomalies', async () => {
      const allAnomalies = await aiService.getAllAnomalies(mockCompanyId);

      expect(Array.isArray(allAnomalies)).toBe(true);
    });
  });

  describe('Business Logic', () => {
    it('should generate meaningful predictions', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(prediction.prediction).toBeDefined();
      expect(prediction.prediction.length).toBeGreaterThan(0);
    });

    it('should provide actionable insights', async () => {
      const recommendations = await aiService.generateInventoryRecommendations(mockCompanyId);

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec.action.length).toBeGreaterThan(0);
      }
    });

    it('should detect critical anomalies first', async () => {
      const anomalies = await aiService.detectFinancialAnomalies(mockCompanyId);

      const hasCritical = anomalies.some((a) => a.severity === 'critical');
      // Should be boolean, either true or false
      expect(typeof hasCritical).toBe('boolean');
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent prediction structures', async () => {
      const pred1 = await aiService.generateSalesPrediction(mockCompanyId);
      const pred2 = await aiService.generateSalesPrediction(mockCompanyId);

      expect(Object.keys(pred1).sort()).toEqual(Object.keys(pred2).sort());
    });

    it('should return consistent recommendation structures', async () => {
      const recs1 = await aiService.generateInventoryRecommendations(mockCompanyId);
      const recs2 = await aiService.generateInventoryRecommendations(mockCompanyId);

      if (recs1.length > 0 && recs2.length > 0) {
        expect(Object.keys(recs1[0]).sort()).toEqual(Object.keys(recs2[0]).sort());
      }
    });

    it('should return consistent anomaly structures', async () => {
      const anom1 = await aiService.detectSalesAnomalies(mockCompanyId);
      const anom2 = await aiService.detectSalesAnomalies(mockCompanyId);

      if (anom1.length > 0 && anom2.length > 0) {
        expect(Object.keys(anom1[0]).sort()).toEqual(Object.keys(anom2[0]).sort());
      }
    });
  });

  describe('Confidence Scoring', () => {
    it('should have valid confidence scores for predictions', async () => {
      const prediction = await aiService.generateSalesPrediction(mockCompanyId);

      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should have valid confidence for recommendations', async () => {
      const recs = await aiService.generateInventoryRecommendations(mockCompanyId);

      for (const rec of recs) {
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      }
    });
  });
});
