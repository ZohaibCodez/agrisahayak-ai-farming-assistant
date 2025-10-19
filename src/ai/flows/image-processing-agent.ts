import { z } from "zod";
import { ai } from "@/ai/genkit";

// Image Processing Output Schema
export const ImageProcessingOutputSchema = z.object({
  processedImage: z.string().describe('Base64 encoded processed image'),
  metadata: z.object({
    originalSize: z.number(),
    processedSize: z.number(),
    compressionRatio: z.number(),
    dimensions: z.object({
      width: z.number(),
      height: z.number()
    }),
    format: z.string(),
    quality: z.number()
  }),
  embeddings: z.array(z.number()).describe('Image embeddings for vector search'),
  cropDetection: z.object({
    cropType: z.string(),
    confidence: z.number(),
    plantParts: z.array(z.string()),
    growthStage: z.string()
  }),
  imageAnalysis: z.object({
    healthIndicators: z.array(z.string()),
    visibleSymptoms: z.array(z.string()),
    environmentalFactors: z.array(z.string()),
    recommendations: z.array(z.string())
  })
});

export type ImageProcessingOutput = z.infer<typeof ImageProcessingOutputSchema>;

// Image Processing Flow
export const imageProcessingAgent = ai.defineFlow(
  {
    name: "imageProcessingAgent",
    inputSchema: z.object({
      imageData: z.string().describe('Base64 encoded image data'),
      farmerText: z.string().optional().describe('Farmer description of symptoms'),
      location: z.string().optional().describe('Farm location for context')
    }),
    outputSchema: ImageProcessingOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Image Preprocessing
      const processedImage = await preprocessImage(input.imageData);
      
      // Step 2: Generate Image Embeddings using Gemini Vision
      const embeddings = await generateImageEmbeddings(processedImage);
      
      // Step 3: Crop Detection and Analysis
      const cropDetection = await detectCropAndAnalyze(processedImage, input.farmerText);
      
      // Step 4: Image Analysis for Health Indicators
      const imageAnalysis = await analyzeImageHealth(processedImage, input.farmerText);
      
      // Step 5: Generate Metadata
      const metadata = await generateImageMetadata(input.imageData, processedImage);
      
      return {
        processedImage,
        metadata,
        embeddings,
        cropDetection,
        imageAnalysis
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Image Preprocessing Functions (simplified for server context)
async function preprocessImage(imageData: string): Promise<string> {
  // For server context, we'll return the image as-is
  // In production, you'd use a proper image processing library like Sharp
  return imageData;
}

async function generateImageEmbeddings(imageData: string): Promise<number[]> {
  try {
    // Use Gemini Vision to generate embeddings
    const prompt = ai.definePrompt({
      name: 'imageEmbeddings',
      input: {schema: z.object({})},
      output: {schema: z.object({description: z.string()})},
      prompt: `Analyze this agricultural image and provide a detailed description focusing on:
      1. Crop type and variety
      2. Plant health indicators
      3. Visible symptoms or diseases
      4. Environmental conditions
      5. Growth stage
      
      Image: ${imageData}
      
      Respond with JSON: {"description": "detailed description here"}`
    });
    
    const {output} = await prompt({});
    // Convert text description to embeddings (simplified - in production use proper embedding model)
    return generateTextEmbeddings(output?.description || '');
  } catch (error) {
    console.error('Embedding generation error:', error);
    // Return zero vector as fallback
    return new Array(384).fill(0);
  }
}

async function detectCropAndAnalyze(imageData: string, farmerText?: string): Promise<{
  cropType: string;
  confidence: number;
  plantParts: string[];
  growthStage: string;
}> {
  try {
    const prompt = ai.definePrompt({
      name: 'cropDetection',
      input: {schema: z.object({})},
      output: {schema: z.object({
        cropType: z.string(),
        confidence: z.number(),
        plantParts: z.array(z.string()),
        growthStage: z.string()
      })},
      prompt: `Analyze this agricultural image and identify:
      1. Crop type (Cotton, Wheat, Rice, Sugarcane, Maize, etc.)
      2. Confidence level (0-1)
      3. Visible plant parts (leaves, stems, flowers, fruits, roots)
      4. Growth stage (seedling, vegetative, flowering, fruiting, mature)
      
      Farmer description: ${farmerText || 'No description provided'}
      
      Image: ${imageData}
      
      Respond with JSON:
      {
        "cropType": "string",
        "confidence": number,
        "plantParts": ["string"],
        "growthStage": "string"
      }`
    });
    
    const {output} = await prompt({});
    return {
      cropType: output?.cropType || 'Unknown',
      confidence: output?.confidence || 0.5,
      plantParts: output?.plantParts || [],
      growthStage: output?.growthStage || 'Unknown'
    };
  } catch (error) {
    console.error('Crop detection error:', error);
    return {
      cropType: 'Unknown',
      confidence: 0.0,
      plantParts: [],
      growthStage: 'Unknown'
    };
  }
}

async function analyzeImageHealth(imageData: string, farmerText?: string): Promise<{
  healthIndicators: string[];
  visibleSymptoms: string[];
  environmentalFactors: string[];
  recommendations: string[];
}> {
  try {
    const prompt = ai.definePrompt({
      name: 'imageHealthAnalysis',
      input: {schema: z.object({})},
      output: {schema: z.object({
        healthIndicators: z.array(z.string()),
        visibleSymptoms: z.array(z.string()),
        environmentalFactors: z.array(z.string()),
        recommendations: z.array(z.string())
      })},
      prompt: `Analyze this agricultural image for plant health and provide:
      1. Health indicators (good/poor growth, color, structure)
      2. Visible symptoms (spots, discoloration, wilting, etc.)
      3. Environmental factors (light, water, soil conditions)
      4. Immediate recommendations
      
      Farmer description: ${farmerText || 'No description provided'}
      
      Image: ${imageData}
      
      Respond with JSON:
      {
        "healthIndicators": ["string"],
        "visibleSymptoms": ["string"],
        "environmentalFactors": ["string"],
        "recommendations": ["string"]
      }`
    });
    
    const {output} = await prompt({});
    return {
      healthIndicators: output?.healthIndicators || [],
      visibleSymptoms: output?.visibleSymptoms || [],
      environmentalFactors: output?.environmentalFactors || [],
      recommendations: output?.recommendations || []
    };
  } catch (error) {
    console.error('Health analysis error:', error);
    return {
      healthIndicators: [],
      visibleSymptoms: [],
      environmentalFactors: [],
      recommendations: []
    };
  }
}

async function generateImageMetadata(originalData: string, processedData: string): Promise<{
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
  format: string;
  quality: number;
}> {
  const originalSize = Math.round((originalData.length * 3) / 4);
  const processedSize = Math.round((processedData.length * 3) / 4);
  const compressionRatio = processedSize / originalSize;
  
  return {
    originalSize,
    processedSize,
    compressionRatio,
    dimensions: {
      width: 1024, // Default dimensions
      height: 768
    },
    format: 'JPEG',
    quality: 0.8
  };
}

// Simple text embedding function (in production, use proper embedding model)
function generateTextEmbeddings(text: string): number[] {
  // This is a simplified implementation
  // In production, use a proper embedding model like OpenAI's text-embedding-ada-002
  const words = text.toLowerCase().split(/\s+/);
  const embeddings = new Array(384).fill(0);
  
  // Simple word frequency-based embedding
  words.forEach(word => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % 384;
    embeddings[index] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
  return embeddings.map(val => val / magnitude);
}
