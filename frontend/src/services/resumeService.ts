import type { CandidateResume } from '../types/resume'
import type { AnalysisStats } from '../types/analysis'

export const mockResumes: CandidateResume[] = [
  {
    id: 'res-101',
    fileName: 'Alex_Morgan_Senior_Fullstack.pdf',
    fileSize: '1.4 MB',
    candidateName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@techmail.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan-dev',
    github: 'github.com/alexm-code',
    summary: 'Versatile Full Stack Architect with 7+ years of experience designing scalable microservices, React applications, and AI integrations. Proven track record of optimizing web performance by 40%.',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'GraphQL', 'AWS', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
    missingSkills: ['Kubernetes', 'Redis'],
    experienceYears: 7,
    overallScore: 94,
    status: 'parsed',
    createdAt: '2026-10-05T14:32:00Z',
    confidenceScore: 98,
    workHistory: [
      {
        id: 'wh-1',
        title: 'Lead Frontend Engineer',
        company: 'Vanguard Systems',
        duration: '2023 - Present',
        location: 'San Francisco, CA',
        description: 'Led a team of 6 engineers building an AI-assisted analytics platform. Reduced bundle size by 35% and increased user engagement.',
      },
      {
        id: 'wh-2',
        title: 'Senior Software Engineer',
        company: 'CloudMetrics Inc.',
        duration: '2020 - 2023',
        location: 'Remote',
        description: 'Architected high-throughput REST APIs and microservices handling 5M+ daily requests in Node.js and PostgreSQL.',
      }
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'B.S. Computer Science',
        institution: 'UC Berkeley',
        year: '2020',
        gpa: '3.8'
      }
    ],
    riskSignals: [
      {
        id: 'risk-1',
        level: 'low',
        title: 'High Career Stability',
        description: 'Consistent employment history with clear title advancement.'
      }
    ],
    aiInsights: [
      'Top 5% candidate match for Senior Software Engineering roles.',
      'Extremely strong frontend ecosystem mastery (React, TypeScript, Tailwind).',
      'Demonstrated experience leading technical teams and optimizing cloud infrastructure.'
    ]
  },
  {
    id: 'res-102',
    fileName: 'Sarah_Chen_AI_ML_Engineer.pdf',
    fileSize: '2.1 MB',
    candidateName: 'Dr. Sarah Chen',
    jobTitle: 'Senior AI / Machine Learning Scientist',
    email: 'sarah.chen@ai-labs.org',
    phone: '+1 (555) 876-5432',
    location: 'Boston, MA',
    linkedin: 'linkedin.com/in/sarah-chen-phd',
    summary: 'PhD in Computer Vision & NLP with 5+ years building LLM fine-tuning pipelines, PyTorch models, and real-time inference endpoints.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Transformer Models', 'LangChain', 'Docker', 'AWS SageMaker', 'FastAPI'],
    matchedSkills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Docker', 'AWS SageMaker'],
    missingSkills: ['C++', 'CUDA'],
    experienceYears: 6,
    overallScore: 91,
    status: 'parsed',
    createdAt: '2026-10-05T12:15:00Z',
    confidenceScore: 96,
    workHistory: [
      {
        id: 'wh-10',
        title: 'Staff AI Researcher',
        company: 'Neural Labs AI',
        duration: '2022 - Present',
        location: 'Boston, MA',
        description: 'Fine-tuned multi-modal LLM models for automated document parsing and entity extraction with 97% accuracy.',
      }
    ],
    education: [
      {
        id: 'edu-10',
        degree: 'Ph.D. Artificial Intelligence',
        institution: 'MIT',
        year: '2021'
      }
    ],
    riskSignals: [
      {
        id: 'risk-10',
        level: 'low',
        title: 'Academic & Industry Credentials',
        description: 'Publications in NeurIPS and CVPR.'
      }
    ],
    aiInsights: [
      'Exceptional candidate for AI / Machine Learning lead position.',
      'Hands-on expertise deploying deep learning pipelines into high-availability production environments.'
    ]
  },
  {
    id: 'res-103',
    fileName: 'Marcus_Vance_Product_Manager.pdf',
    fileSize: '890 KB',
    candidateName: 'Marcus Vance',
    jobTitle: 'Principal Product Manager',
    email: 'marcus.vance@techlead.io',
    phone: '+1 (555) 432-1098',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/marcusvance-pm',
    summary: 'Data-driven PM with 8+ years leading enterprise SaaS products from 0-to-1. Managed product roadmaps, user growth, and ATS integrations.',
    skills: ['Product Strategy', 'Roadmapping', 'Agile/Scrum', 'Data Analytics', 'SQL', 'Mixpanel', 'Figma', 'A/B Testing'],
    matchedSkills: ['Product Strategy', 'Roadmapping', 'Agile/Scrum', 'SQL'],
    missingSkills: ['Python', 'API Design'],
    experienceYears: 8,
    overallScore: 84,
    status: 'parsed',
    createdAt: '2026-10-04T18:45:00Z',
    confidenceScore: 94,
    workHistory: [
      {
        id: 'wh-20',
        title: 'Group Product Manager',
        company: 'SaaSify Platforms',
        duration: '2021 - Present',
        location: 'New York, NY',
        description: 'Grew ARR from $12M to $34M by launching automated HR workflows and candidate screening integrations.',
      }
    ],
    education: [
      {
        id: 'edu-20',
        degree: 'M.B.A. Innovation & Strategy',
        institution: 'Columbia University',
        year: '2018'
      }
    ],
    riskSignals: [
      {
        id: 'risk-20',
        level: 'medium',
        title: 'Role Shift Alert',
        description: 'Candidate transitions from pure Product Management to Technical Program Management.'
      }
    ],
    aiInsights: [
      'Strong candidate for Product Leadership roles with revenue growth track record.'
    ]
  },
  {
    id: 'res-104',
    fileName: 'Elena_Rostova_Backend_Dev.docx',
    fileSize: '512 KB',
    candidateName: 'Elena Rostova',
    jobTitle: 'Senior Backend Engineer',
    email: 'elena.rostova@devnet.com',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    summary: 'Distributed systems backend developer specialized in Golang, Rust, microservices architecture, and high-frequency messaging.',
    skills: ['Go', 'Rust', 'Kafka', 'Kubernetes', 'PostgreSQL', 'gRPC', 'Distributed Systems'],
    matchedSkills: ['Go', 'Kubernetes', 'PostgreSQL', 'Kafka'],
    missingSkills: ['TypeScript', 'GraphQL'],
    experienceYears: 5,
    overallScore: 88,
    status: 'parsed',
    createdAt: '2026-10-04T11:20:00Z',
    confidenceScore: 97,
    workHistory: [],
    education: [],
    riskSignals: [],
    aiInsights: ['Strong backend systems proficiency with Go & Kafka.']
  },
  {
    id: 'res-105',
    fileName: 'David_Kovacs_DevOps.pdf',
    fileSize: '1.1 MB',
    candidateName: 'David Kovacs',
    jobTitle: 'Cloud Infrastructure / DevOps Lead',
    email: 'david.k@cloudcraft.io',
    phone: '+1 (555) 901-2345',
    location: 'Austin, TX',
    summary: 'Cloud Architect with 9+ years managing AWS multi-region infrastructure, Terraform IAC, CI/CD pipelines, and SOC2 compliance.',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Helm', 'Prometheus', 'Security'],
    matchedSkills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
    missingSkills: ['Node.js'],
    experienceYears: 9,
    overallScore: 89,
    status: 'parsed',
    createdAt: '2026-10-03T16:10:00Z',
    confidenceScore: 95,
    workHistory: [],
    education: [],
    riskSignals: [],
    aiInsights: ['Expert level DevOps engineer with AWS & Kubernetes certifications.']
  },
  {
    id: 'res-106',
    fileName: 'Processing_Candidate_File.pdf',
    fileSize: '1.8 MB',
    candidateName: 'Jessica Vance',
    jobTitle: 'Frontend Developer',
    email: 'jessica.v@webstudio.dev',
    phone: '+1 (555) 678-9012',
    location: 'Chicago, IL',
    summary: 'Analyzing candidate profile and extracting technical skills...',
    skills: ['React', 'CSS', 'JavaScript'],
    matchedSkills: ['React'],
    missingSkills: [],
    experienceYears: 3,
    overallScore: 78,
    status: 'processing',
    createdAt: '2026-10-05T17:00:00Z',
    confidenceScore: 85,
    workHistory: [],
    education: [],
    riskSignals: [],
    aiInsights: ['AI model currently performing deep semantic extraction.']
  }
]

export const initialStats: AnalysisStats = {
  totalResumes: 1248,
  successfullyParsed: 1192,
  processingCount: 4,
  failedCount: 12,
  avgMatchScore: 88,
  accuracyRate: 98.6,
  topSkills: [
    { name: 'React / Next.js', count: 412, percentage: 85 },
    { name: 'TypeScript', count: 388, percentage: 80 },
    { name: 'Python & AI/LLMs', count: 340, percentage: 70 },
    { name: 'Node.js / Express', count: 310, percentage: 64 },
    { name: 'AWS & Cloud Systems', count: 295, percentage: 61 },
    { name: 'Docker / Kubernetes', count: 260, percentage: 54 }
  ]
}

export class ResumeService {
  private static resumes = [...mockResumes]

  static async getResumes(): Promise<CandidateResume[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.resumes]), 200)
    })
  }

  static async getResumeById(id: string): Promise<CandidateResume | undefined> {
    return new Promise((resolve) => {
      const match = this.resumes.find((r) => r.id === id)
      setTimeout(() => resolve(match ? { ...match } : undefined), 150)
    })
  }

  static async getStats(): Promise<AnalysisStats> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...initialStats }), 150)
    })
  }

  static async uploadAndParse(file: File): Promise<CandidateResume> {
    return new Promise((resolve) => {
      const newResume: CandidateResume = {
        id: `res-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        candidateName: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        jobTitle: 'Extracted Candidate Profile',
        email: 'extracted.candidate@parser.ai',
        phone: '+1 (555) 123-4567',
        location: 'Remote / United States',
        summary: 'Newly uploaded resume parsed using Resume Parser AI engine. Deep skill mapping and work experience extraction completed.',
        skills: ['TypeScript', 'React', 'Node.js', 'Python', 'Tailwind CSS', 'GraphQL', 'PostgreSQL'],
        matchedSkills: ['TypeScript', 'React', 'Node.js', 'Python'],
        missingSkills: ['AWS Architecture', 'Kubernetes'],
        experienceYears: 5,
        overallScore: Math.floor(Math.random() * 15) + 82, // 82 - 97 score range
        status: 'parsed',
        createdAt: new Date().toISOString(),
        confidenceScore: 97,
        workHistory: [
          {
            id: `wh-${Date.now()}-1`,
            title: 'Senior Software Specialist',
            company: 'Tech Solutions Corp',
            duration: '2022 - Present',
            location: 'San Francisco, CA',
            description: 'Engineered high-performance web APIs, optimized frontend render loops, and managed CI/CD deployment pipelines.'
          }
        ],
        education: [
          {
            id: `edu-${Date.now()}-1`,
            degree: 'B.S. Software Engineering',
            institution: 'State University',
            year: '2021'
          }
        ],
        riskSignals: [
          {
            id: `risk-${Date.now()}-1`,
            level: 'low',
            title: 'Verified Candidate Profile',
            description: 'Skills and duration align with typical career trajectories.'
          }
        ],
        aiInsights: [
          'High match for Senior Full Stack & Software Engineering opportunities.',
          'Comprehensive experience across frontend frameworks and relational databases.'
        ]
      }

      this.resumes.unshift(newResume)
      setTimeout(() => resolve(newResume), 1200)
    })
  }

  static async deleteResume(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.resumes = this.resumes.filter((r) => r.id !== id)
      setTimeout(() => resolve(true), 200)
    })
  }
}
