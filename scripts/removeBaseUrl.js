const fs = require("fs");

const generatedFiles = [
  "lib/api/avatars/types.gen.ts",
  "lib/api/orchestrator/types.gen.ts",
  "lib/api/operator/types.gen.ts",
];

for (const file of generatedFiles) {
  const code = fs.readFileSync(file, "utf-8");
  const updatedContent = code.replace(
    /baseUrl:\s*'[^']*'\s*\|\s*\(string\s*&\s*{}\);?/g,
    "baseUrl: (string & {});"
  );
  fs.writeFileSync(file, updatedContent);
}
