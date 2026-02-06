const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Expanded Fallback headers for skill/experience sections
const SKILL_HEADERS = [
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'TECHNOLOGIES',
    'TOOLS', 'PROGRAMMING LANGUAGES', 'STRENGTHS', 'TECH STACK',
    'EXPERTISE', 'SKILLSET', 'PROFICIENCIES', 'KEY SKILLS'
];
const EXP_HEADERS = [
    'EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT', 'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE', 'PROJECTS', 'CAREER SUMMARY'
];

// Dictionary of most common tech terms to find even if sections fail
const TECH_DICTIONARY = [
    'Javascript', 'React', 'Node.js', 'MongoDB', 'Express', 'Python', 'Java', 'C++', 'PHP',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Redux', 'SQL', 'PostgreSQL', 'AWS', 'Docker',
    'Kubernetes', 'Firebase', 'TypeScript', 'Angular', 'Vue', 'Next.js', 'Figma', 'Postman',
    'Git', 'GitHub', 'Agile', 'DevOps', 'QA', 'MERN', 'MEAN', 'REST API', 'GraphQL', 'Swift',
    'Android', 'iOS', 'Flutter', 'React Native'
];

const parseResume = async (filePath, fileType) => {
    try {
        let rawText = '';
        const isUrl = filePath.startsWith('http');

        // 1. Extract Text
        if (fileType === 'application/pdf') {
            let dataBuffer;
            if (isUrl) {
                const response = await axios.get(filePath, { responseType: 'arraybuffer' });
                dataBuffer = Buffer.from(response.data);
            } else {
                dataBuffer = fs.readFileSync(filePath);
            }
            const data = await pdf(dataBuffer);
            rawText = data.text;
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileType === 'application/msword'
        ) {
            if (isUrl) {
                const response = await axios.get(filePath, { responseType: 'arraybuffer' });
                const result = await mammoth.extractRawText({ buffer: Buffer.from(response.data) });
                rawText = result.value;
            } else {
                const result = await mammoth.extractRawText({ path: filePath });
                rawText = result.value;
            }
        } else {
            throw new Error('Unsupported file type');
        }

        // 2. Try Gemini AI Extraction (Updated name to 'gemini-pro')
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here') {
            try {
                const aiData = await extractWithGemini(rawText);
                return { rawText, ...aiData };
            } catch (aiError) {
                console.error("Gemini Extraction Failed, falling back to smart regex:", aiError.message);
            }
        }

        // 3. Smart Fallback Extraction
        const foundSkills = [];
        const normalizedText = rawText.toLowerCase();

        // Method A: Section Extraction
        const skillsRedirect = extractSection(rawText, SKILL_HEADERS);
        if (skillsRedirect) {
            const sectionSkills = skillsRedirect.split(/[,;\n|•]+/)
                .map(s => s.trim())
                .filter(s => s.length > 1 && s.length < 40);
            foundSkills.push(...sectionSkills);
        }

        // Method B: Dictionary Scan (Catches things like 'MERN' even if no header)
        TECH_DICTIONARY.forEach(term => {
            // Use word boundary to prevent matching 'Java' inside 'JavaScript'
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(rawText)) {
                foundSkills.push(term);
            }
        });

        const uniqueKeywords = [...new Set(foundSkills)].slice(0, 50);
        const experienceRedirect = extractSection(rawText, EXP_HEADERS);

        const expMatch = rawText.match(/(\d+|\w+)\+?\s+years?\s+of\s+experience/i);
        const totalExperience = expMatch ? `${expMatch[1]} Years` : "Fresher (Estimated)";

        return {
            rawText,
            skills: uniqueKeywords,
            experience: experienceRedirect ? [{
                title: "Extracted Section",
                company: "Analysed from Document",
                dates: "Found in Experience Section",
                description: experienceRedirect.substring(0, 2000)
            }] : [],
            education: [],
            keywords: uniqueKeywords,
            totalExperience
        };

    } catch (error) {
        console.error('Error parsing resume:', error);
        throw error;
    }
};

const extractWithGemini = async (text) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Switch to 'gemini-pro' - often more stable across regions than the 1.5 versions
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are an expert Resume Parser. Analyze the following resume text and extract the data in strict JSON format.
    STRICT RULE: Only extract information that is explicitly present.
    
    Resume Text:
    "${text.substring(0, 10000)}"

    Required JSON Structure:
    {
        "contact": { "name": "String", "email": "String", "phone": "String" },
        "skills": ["String"],
        "experience": [{ "title": "String", "company": "String", "dates": "String", "description": "String" }],
        "totalExperience": "String",
        "keywords": ["String"] (Extract ALL tech stacks like MERN, Python, React, etc.)
    }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const json = JSON.parse(textResponse);
        const allKeywords = [...new Set([...(json.keywords || []), ...(json.skills || [])])];
        return {
            skills: allKeywords,
            keywords: allKeywords,
            experience: json.experience || [],
            contact: json.contact || {},
            totalExperience: json.totalExperience || "Unknown"
        };
    } catch (e) {
        throw new Error("Invalid JSON from AI");
    }
}

const extractSection = (text, headers) => {
    const lines = text.split('\n');
    let content = '';
    let found = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toUpperCase();
        // Check if line contains any of the headers
        const isHeader = headers.some(h => line === h || line.startsWith(h + ':') || line.startsWith(h + ' '));

        if (isHeader) {
            found = true;
            continue;
        }
        if (found) {
            // Stop if we hit another likely header (all caps, short)
            if (line.length > 2 && line.length < 25 && /^[A-Z\s]+$/.test(line) && headers.some(h => line.includes(h))) {
                break;
            }
            content += lines[i] + ' ';
        }
    }
    return found ? content.trim() : null;
};

module.exports = { parseResume };
