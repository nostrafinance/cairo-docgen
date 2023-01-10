function parseNatspec(comments) {
  const lines = comments.split(/\n+/g).filter(Boolean);
  const natspec = {};

  let appendToLastTagLambda = null;
  lines.forEach(line => {
    const match = line.match(/^\/\/+\s*@(\w+)\s*([\s\S]*)/);
    if (match) {
      const [, tag, content] = match;
      if (tag === 'param' || tag === 'return') {
        const [name, ...description] = content.split(/\s+/);
        natspec[tag + 's'] = natspec[tag + 's'] || {};
        natspec[tag + 's'][name] = description.join(' ');
        appendToLastTagLambda = str => natspec[tag + 's'][name] += str;
      } else {
        natspec[tag] = content;
        appendToLastTagLambda = str => natspec[tag] += str;
      }
    }
    else {
      if (appendToLastTagLambda) {
        const description = line.replace(/\/\/+\s*/g, "")
        appendToLastTagLambda(` ${description}`);
      }
    }
  });

  return natspec;
}

function extractFunctions(input) {
  const functionsRegex = /((?:(?:(?:\/\/[^\n]*\n?)*)(?:(@[^\n]+)\n))?func\s+([^\s(]+)(?:\s*\{([^\}]*)\})?\s*\(([^)]*)\)\s*(?:->\s*\(([^)]*)\))?)/g;
  const functions = [];
  let match;
  while (match = functionsRegex.exec(input)) {
    const [, functionDeclaration, decorator, name,, inputsString, outputsString] = match;
    const functionInterface = `func ${name}(${inputsString ? inputsString.replace(/(\r\n|\n|\r)/gm, "").trim() : ""})${outputsString ? ` -> (${outputsString.replace(/(\r\n|\n|\r)/gm, "").trim()})` : ""}`
    if (!decorator) continue;
    
    const startIndex = match.index;
    const endIndex = startIndex + functionDeclaration.length;

    const inputs = inputsString.split(',').filter(p => Boolean(p.trim())).map(param => {
        const [name, type] = param.split(':').map(s => s.trim());
        return { name, type };
    });

    let outputs = [];
    if (outputsString) {
        outputs = outputsString.split(',').filter(p => Boolean(p.trim())).map(param => {
            const [name, type] = param.split(':').map(s => s.trim());
            return { name, type };
        });
    }

    const commentsRegex = /(?:\/\/[^\n]*\n?)/g;
    const comments = [];
    let commentMatch;
    while (commentMatch = commentsRegex.exec(input.substring(startIndex, endIndex))) {
        comments.push(commentMatch[0]);
    }

    functions.push({
        name,
        decorator: decorator.trim(),
        inputs,
        outputs,
        comments: comments.join('\n'),
        functionInterface
    });
  }

  return functions;
}

function parse(input) {
  const functions = extractFunctions(input);
  const externalFunctions = [];
  const viewFunctions = [];
  const events = [];
  const l1Handlers = [];
  let constructor = null;
  for (let i = 0; i < functions.length;i ++) {
      const f = functions[i];
      if (f.comments.length > 0) {
          functions[i].natspec = parseNatspec(f.comments);
      }

      switch (f.decorator) {
        case "@external": 
          externalFunctions.push(functions[i]);
          break;
        case "@view": 
          viewFunctions.push(functions[i]);
          break;
        case "@event": 
          events.push(functions[i]);
          break;
        case "@l1_handler": 
          l1Handlers.push(functions[i]);
          break;
        case "@constructor": 
          constructor = functions[i];
          break;
      }
  }

  return { constructor, externalFunctions, viewFunctions, events, l1Handlers };
}
  
module.exports = {
  parse
};
