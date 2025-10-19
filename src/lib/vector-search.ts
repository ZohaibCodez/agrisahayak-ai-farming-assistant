import { knowledgeBase, CropDisease } from './knowledge-base';

// Vector search implementation
export class VectorSearch {
  private embeddings: Map<string, number[]> = new Map();
  private dimension: number = 384; // Embedding dimension

  constructor() {
    this.initializeEmbeddings();
  }

  // Initialize embeddings for all diseases in knowledge base
  private async initializeEmbeddings(): Promise<void> {
    const diseases = knowledgeBase.getAllDiseases();
    
    for (const disease of diseases) {
      const embedding = this.generateEmbedding(
        `${disease.disease} ${disease.crop} ${disease.symptoms.join(' ')} ${disease.causes.join(' ')}`
      );
      this.embeddings.set(disease.id, embedding);
    }
  }

  // Generate embedding for text (simplified implementation)
  private generateEmbedding(text: string): number[] {
    // In production, use a proper embedding model like OpenAI's text-embedding-ada-002
    // or Google's Universal Sentence Encoder
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const embedding = new Array(this.dimension).fill(0);
    
    // Simple TF-IDF-like embedding
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
    
    const totalWords = words.length;
    const uniqueWords = wordCounts.size;
    
    wordCounts.forEach((count, word) => {
      const tf = count / totalWords;
      const idf = Math.log(uniqueWords / (count + 1));
      const tfidf = tf * idf;
      
      // Hash word to embedding dimension
      const hash = this.hashString(word);
      const index = Math.abs(hash) % this.dimension;
      embedding[index] += tfidf;
    });
    
    // Normalize embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  // Hash string to number
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search for similar diseases using vector similarity
  async searchSimilarDiseases(
    query: string,
    crop?: string,
    limit: number = 5,
    threshold: number = 0.3
  ): Promise<Array<CropDisease & { similarity: number }>> {
    try {
      // Generate embedding for query
      const queryEmbedding = this.generateEmbedding(query);
      
      // Calculate similarities
      const similarities: Array<CropDisease & { similarity: number }> = [];
      
      for (const [diseaseId, diseaseEmbedding] of this.embeddings) {
        const similarity = this.cosineSimilarity(queryEmbedding, diseaseEmbedding);
        
        if (similarity >= threshold) {
          const disease = knowledgeBase.getDiseaseById(diseaseId);
          if (disease && (!crop || disease.crop.toLowerCase().includes(crop.toLowerCase()))) {
            similarities.push({ ...disease, similarity });
          }
        }
      }
      
      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }

  // Find most similar disease to given symptoms
  async findMostSimilarDisease(
    symptoms: string[],
    crop?: string
  ): Promise<(CropDisease & { similarity: number }) | null> {
    const query = symptoms.join(' ');
    const results = await this.searchSimilarDiseases(query, crop, 1, 0.5);
    return results.length > 0 ? results[0] : null;
  }

  // Get disease recommendations based on location and season
  async getDiseaseRecommendations(
    location: string,
    crop: string,
    season: string
  ): Promise<CropDisease[]> {
    const query = `${crop} diseases ${location} ${season}`;
    const results = await this.searchSimilarDiseases(query, crop, 10, 0.2);
    return results.map(r => ({ ...r, similarity: undefined }));
  }

  // Add new disease to vector index
  async addDiseaseToIndex(disease: CropDisease): Promise<void> {
    const embedding = this.generateEmbedding(
      `${disease.disease} ${disease.crop} ${disease.symptoms.join(' ')} ${disease.causes.join(' ')}`
    );
    this.embeddings.set(disease.id, embedding);
  }

  // Update disease in vector index
  async updateDiseaseInIndex(disease: CropDisease): Promise<void> {
    await this.addDiseaseToIndex(disease);
  }

  // Remove disease from vector index
  removeDiseaseFromIndex(diseaseId: string): void {
    this.embeddings.delete(diseaseId);
  }

  // Get embedding for a disease
  getDiseaseEmbedding(diseaseId: string): number[] | undefined {
    return this.embeddings.get(diseaseId);
  }

  // Get all embeddings
  getAllEmbeddings(): Map<string, number[]> {
    return new Map(this.embeddings);
  }
}

// Singleton instance
export const vectorSearch = new VectorSearch();

// Utility functions for vector operations
export class VectorUtils {
  // Calculate distance between two vectors
  static euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Calculate Manhattan distance between two vectors
  static manhattanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.abs(a[i] - b[i]);
    }
    return sum;
  }

  // Normalize vector to unit length
  static normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  // Calculate dot product of two vectors
  static dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  // Calculate vector magnitude
  static magnitude(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }
}

// Advanced search functions
export class AdvancedVectorSearch extends VectorSearch {
  // Search with multiple query types
  async multiQuerySearch(
    queries: {
      symptoms?: string;
      crop?: string;
      location?: string;
      season?: string;
    },
    limit: number = 5
  ): Promise<Array<CropDisease & { similarity: number; matchType: string }>> {
    const results: Array<CropDisease & { similarity: number; matchType: string }> = [];
    
    // Search by symptoms
    if (queries.symptoms) {
      const symptomResults = await this.searchSimilarDiseases(
        queries.symptoms,
        queries.crop,
        limit,
        0.2
      );
      results.push(...symptomResults.map(r => ({ ...r, matchType: 'symptoms' })));
    }
    
    // Search by crop and location
    if (queries.crop && queries.location) {
      const locationResults = await this.searchSimilarDiseases(
        `${queries.crop} ${queries.location}`,
        queries.crop,
        limit,
        0.2
      );
      results.push(...locationResults.map(r => ({ ...r, matchType: 'location' })));
    }
    
    // Search by season
    if (queries.season) {
      const seasonResults = await this.searchSimilarDiseases(
        queries.season,
        queries.crop,
        limit,
        0.2
      );
      results.push(...seasonResults.map(r => ({ ...r, matchType: 'season' })));
    }
    
    // Remove duplicates and sort by similarity
    const uniqueResults = new Map<string, CropDisease & { similarity: number; matchType: string }>();
    
    results.forEach(result => {
      const existing = uniqueResults.get(result.id);
      if (!existing || result.similarity > existing.similarity) {
        uniqueResults.set(result.id, result);
      }
    });
    
    return Array.from(uniqueResults.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Search with filters
  async filteredSearch(
    query: string,
    filters: {
      crop?: string;
      severity?: string[];
      confidence?: number;
      maxCost?: number;
    },
    limit: number = 5
  ): Promise<Array<CropDisease & { similarity: number }>> {
    const results = await this.searchSimilarDiseases(query, filters.crop, limit * 2, 0.1);
    
    return results
      .filter(disease => {
        if (filters.severity && !filters.severity.includes(disease.severity)) return false;
        if (filters.confidence && disease.confidence < filters.confidence) return false;
        if (filters.maxCost && disease.treatment.cost > filters.maxCost) return false;
        return true;
      })
      .slice(0, limit);
  }
}

// Export advanced search instance
export const advancedVectorSearch = new AdvancedVectorSearch();
