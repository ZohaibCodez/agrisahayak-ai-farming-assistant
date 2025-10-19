import { z } from "zod";

// Knowledge Base Schema
export const CropDiseaseSchema = z.object({
  id: z.string(),
  crop: z.string(),
  disease: z.string(),
  symptoms: z.array(z.string()),
  causes: z.array(z.string()),
  treatment: z.object({
    steps: z.array(z.string()),
    materials: z.array(z.string()),
    cost: z.number(),
    duration: z.string(),
    safety: z.array(z.string())
  }),
  prevention: z.array(z.string()),
  severity: z.enum(['Low', 'Medium', 'High']),
  confidence: z.number().min(0).max(1),
  embeddings: z.array(z.number()).optional()
});

export type CropDisease = z.infer<typeof CropDiseaseSchema>;

// Knowledge Base Data
export const CROP_DISEASE_KNOWLEDGE: CropDisease[] = [
  {
    id: "cotton-leaf-curl-1",
    crop: "Cotton",
    disease: "Cotton Leaf Curl Virus",
    symptoms: [
      "Upward curling of leaves",
      "Yellowing of leaf margins",
      "Stunted plant growth",
      "Reduced boll formation",
      "Whitefly infestation visible"
    ],
    causes: [
      "Whitefly transmission",
      "Viral infection",
      "Poor field hygiene",
      "Infected planting material"
    ],
    treatment: {
      steps: [
        "Remove and destroy infected plants immediately",
        "Apply systemic insecticides to control whiteflies",
        "Use resistant cotton varieties",
        "Implement crop rotation with non-host crops"
      ],
      materials: [
        "Systemic insecticides (Imidacloprid, Thiamethoxam)",
        "Whitefly traps",
        "Resistant cotton seeds",
        "Disinfectant for tools"
      ],
      cost: 15000,
      duration: "2-3 weeks",
      safety: [
        "Wear protective clothing during spraying",
        "Avoid spraying during flowering",
        "Follow proper disposal of infected plants"
      ]
    },
    prevention: [
      "Use certified disease-free seeds",
      "Implement proper field sanitation",
      "Monitor whitefly populations regularly",
      "Practice crop rotation",
      "Remove weed hosts"
    ],
    severity: "High",
    confidence: 0.95
  },
  {
    id: "wheat-rust-1",
    crop: "Wheat",
    disease: "Wheat Rust (Stem Rust)",
    symptoms: [
      "Orange-red pustules on stems and leaves",
      "Powdery rust spores",
      "Yellowing and wilting of leaves",
      "Reduced grain quality",
      "Premature plant death"
    ],
    causes: [
      "Fungal infection (Puccinia graminis)",
      "High humidity conditions",
      "Crowded planting",
      "Infected crop residues"
    ],
    treatment: {
      steps: [
        "Apply fungicide spray immediately",
        "Remove infected plant parts",
        "Improve field drainage",
        "Apply balanced fertilizer"
      ],
      materials: [
        "Fungicides (Tebuconazole, Propiconazole)",
        "Spray equipment",
        "Balanced NPK fertilizer",
        "Drainage materials"
      ],
      cost: 8000,
      duration: "1-2 weeks",
      safety: [
        "Wear protective gear during spraying",
        "Avoid spraying in windy conditions",
        "Follow proper fungicide rotation"
      ]
    },
    prevention: [
      "Use rust-resistant wheat varieties",
      "Practice crop rotation",
      "Maintain proper plant spacing",
      "Remove crop residues",
      "Monitor weather conditions"
    ],
    severity: "High",
    confidence: 0.92
  },
  {
    id: "rice-blast-1",
    crop: "Rice",
    disease: "Rice Blast",
    symptoms: [
      "Diamond-shaped lesions on leaves",
      "Grayish-white centers with brown borders",
      "Node infection causing stem breakage",
      "Panicle infection reducing yield",
      "Seedling mortality"
    ],
    causes: [
      "Fungal infection (Magnaporthe oryzae)",
      "High humidity and temperature",
      "Excessive nitrogen application",
      "Poor water management"
    ],
    treatment: {
      steps: [
        "Apply fungicide at first sign of disease",
        "Reduce nitrogen application",
        "Improve water drainage",
        "Remove infected plant debris"
      ],
      materials: [
        "Fungicides (Tricyclazole, Isoprothiolane)",
        "Drainage equipment",
        "Balanced fertilizer",
        "Sanitation tools"
      ],
      cost: 12000,
      duration: "2-3 weeks",
      safety: [
        "Follow fungicide safety guidelines",
        "Avoid excessive nitrogen",
        "Proper water management"
      ]
    },
    prevention: [
      "Use blast-resistant rice varieties",
      "Proper water management",
      "Balanced fertilizer application",
      "Field sanitation",
      "Crop rotation"
    ],
    severity: "High",
    confidence: 0.90
  },
  {
    id: "sugarcane-red-rot-1",
    crop: "Sugarcane",
    disease: "Red Rot",
    symptoms: [
      "Reddish discoloration of internal tissue",
      "Hollowing of cane stalks",
      "Reduced sugar content",
      "Premature wilting",
      "Foul smell from infected tissue"
    ],
    causes: [
      "Fungal infection (Colletotrichum falcatum)",
      "High humidity",
      "Poor drainage",
      "Infected planting material"
    ],
    treatment: {
      steps: [
        "Remove and burn infected canes",
        "Apply fungicide treatment",
        "Improve field drainage",
        "Use healthy planting material"
      ],
      materials: [
        "Fungicides (Carbendazim, Mancozeb)",
        "Drainage materials",
        "Healthy setts",
        "Disinfectant"
      ],
      cost: 18000,
      duration: "3-4 weeks",
      safety: [
        "Proper disposal of infected material",
        "Follow fungicide guidelines",
        "Use protective equipment"
      ]
    },
    prevention: [
      "Use disease-free setts",
      "Proper field drainage",
      "Crop rotation",
      "Field sanitation",
      "Resistant varieties"
    ],
    severity: "High",
    confidence: 0.88
  },
  {
    id: "maize-downy-mildew-1",
    crop: "Maize",
    disease: "Downy Mildew",
    symptoms: [
      "Yellow streaks on leaves",
      "Downy growth on leaf undersides",
      "Stunted plant growth",
      "Malformed ears",
      "Reduced yield"
    ],
    causes: [
      "Fungal infection (Peronosclerospora spp.)",
      "High humidity",
      "Cool temperatures",
      "Infected seeds"
    ],
    treatment: {
      steps: [
        "Apply fungicide spray",
        "Remove infected plants",
        "Improve air circulation",
        "Use resistant varieties"
      ],
      materials: [
        "Fungicides (Metalaxyl, Fosetyl-Al)",
        "Resistant seeds",
        "Spray equipment",
        "Sanitation tools"
      ],
      cost: 10000,
      duration: "2-3 weeks",
      safety: [
        "Follow fungicide safety",
        "Proper plant spacing",
        "Field sanitation"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Proper plant spacing",
      "Crop rotation",
      "Field hygiene",
      "Seed treatment"
    ],
    severity: "Medium",
    confidence: 0.85
  }
];

// Vector Search Functions
export class KnowledgeBase {
  private diseases: CropDisease[] = CROP_DISEASE_KNOWLEDGE;

  // Simple text-based search (will be enhanced with vector search)
  searchDiseases(query: string, crop?: string): CropDisease[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.diseases
      .filter(disease => !crop || disease.crop.toLowerCase().includes(crop.toLowerCase()))
      .map(disease => {
        let score = 0;
        
        // Check disease name
        if (disease.disease.toLowerCase().includes(query.toLowerCase())) {
          score += 10;
        }
        
        // Check symptoms
        disease.symptoms.forEach(symptom => {
          searchTerms.forEach(term => {
            if (symptom.toLowerCase().includes(term)) {
              score += 3;
            }
          });
        });
        
        // Check causes
        disease.causes.forEach(cause => {
          searchTerms.forEach(term => {
            if (cause.toLowerCase().includes(term)) {
              score += 2;
            }
          });
        });
        
        return { ...disease, searchScore: score };
      })
      .filter(disease => disease.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  }

  // Get disease by ID
  getDiseaseById(id: string): CropDisease | undefined {
    return this.diseases.find(disease => disease.id === id);
  }

  // Get diseases by crop
  getDiseasesByCrop(crop: string): CropDisease[] {
    return this.diseases.filter(disease => 
      disease.crop.toLowerCase().includes(crop.toLowerCase())
    );
  }

  // Get all crops
  getAllCrops(): string[] {
    return [...new Set(this.diseases.map(disease => disease.crop))];
  }

  // Get all diseases
  getAllDiseases(): CropDisease[] {
    return [...this.diseases];
  }

  // Add new disease to knowledge base
  addDisease(disease: CropDisease): void {
    this.diseases.push(disease);
  }

  // Update disease in knowledge base
  updateDisease(id: string, updates: Partial<CropDisease>): boolean {
    const index = this.diseases.findIndex(disease => disease.id === id);
    if (index !== -1) {
      this.diseases[index] = { ...this.diseases[index], ...updates };
      return true;
    }
    return false;
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
