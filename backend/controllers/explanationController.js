const explanationService = require('../services/explanationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class ExplanationController {
  /**
   * GET /api/explanations
   * Get all financial term explanations
   */
  async getAllExplanations(req, res, next) {
    try {
      const explanations = await explanationService.getAllExplanations();
      return successResponse(res, 200, 'Financial term explanations retrieved successfully', explanations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/explanations/:term
   * Get explanation for a specific financial term
   */
  async getExplanationByTerm(req, res, next) {
    try {
      const { term } = req.params;
      const explanation = await explanationService.getExplanationByTerm(term);

      if (!explanation) {
        return errorResponse(res, 404, `Explanation for term '${term}' not found`, 'TERM_NOT_FOUND');
      }

      return successResponse(res, 200, `Explanation for '${explanation.term}' retrieved successfully`, explanation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/explanations/chat
   * Interactive AI Financial Chatbot endpoint
   */
  async askAIChat(req, res, next) {
    try {
      const { query, context } = req.body;
      if (!query || typeof query !== 'string' || query.trim() === '') {
        return errorResponse(res, 400, 'Query string is required');
      }

      const response = await explanationService.processAIChatQuery(query, context);
      return successResponse(res, 200, 'AI response generated successfully', response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExplanationController();
