import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Gwon\\.gemini\\antigravity\\brain\\5570b53b-ba4c-4bc1-89b2-5951aff1f320\\.system_generated\\logs\\transcript_full.jsonl';

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index === 91) {
            console.log("=== Found Step 91 content ===");
            console.log(obj.content);
            break;
        }
    } catch (e) {
        // ignore parsing errors for incomplete lines
    }
}
