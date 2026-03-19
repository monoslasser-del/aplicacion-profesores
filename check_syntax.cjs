const fs = require('fs');
const ts = require('typescript');

const fileName = 'src/app/pages/ActivitiesScreen.tsx';
const sourceCode = fs.readFileSync(fileName, 'utf8');

const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);

const diag = sourceFile.parseDiagnostics;
if (diag.length > 0) {
  diag.forEach(d => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(d.start);
    console.log(`Error at line ${line + 1}, col ${character + 1}: ${d.messageText}`);
  });
} else {
  console.log('No syntax errors found by TS parser.');
}
