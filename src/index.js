#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const parser = require('./parser');

const MD_TEMPLATE = Handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, "./templates/md.hbs"), {encoding:'utf8', flag:'r'})
);


function generateDocs(content, outPath) {
  const { constructor, externalFunctions, viewFunctions, events, l1Handlers } = parser.parse(content);
  
  const formattedFileContent = MD_TEMPLATE({ constructor, externalFunctions, viewFunctions, events, l1Handlers });
  fs.writeFile(outPath, formattedFileContent, (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`File written successfully to ${outPath}`);
      }
    });
}


program
  .description('Generate documentation for Cairo smart contracts')
  .arguments('<inputFile> [outputDir]')
  .option('-o, --outputDir <outputDir>', 'Directory to write the generated documentation to', '.')
  .action((inputFile, outputDir, defaults) => {
    outputDir = outputDir ?? defaults.outputDir;
    const sourceContent = fs.readFileSync(inputFile, {encoding:'utf8', flag:'r'});
    const outputFile = path.resolve(outputDir, `${path.basename(inputFile)}.md`);
    
    generateDocs(sourceContent, outputFile);
  });

program.parse(process.argv);