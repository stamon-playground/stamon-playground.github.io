import CssBaseline from "@suid/material/CssBaseline"
import Box from "@suid/material/Box"
import Toolbar from "@suid/material/Toolbar"
import AppBar from "@suid/material/AppBar"
import Typography from "@suid/material/Typography"
import Button from "@suid/material/Button"
import { createSignal } from "solid-js"
import { Editor } from "solid-prism-editor"
import { basicSetup } from "solid-prism-editor/setups"
import { languages } from "solid-prism-editor/prism"
import stamon from "./stamon"

import "solid-prism-editor/layout.css"
import "solid-prism-editor/search.css"
import "solid-prism-editor/themes/github-light.css"

languages["stamon"] = {
  'comment': {
    pattern: /\/\/.*/,
    greedy: true
  },
  'string': {
    pattern: /"(?:\\.|[^\\"])*"/,
    greedy: true,
    inside: {
      'escape': {
        pattern: /\\(?:\\|0|n|t|"|x[0-9a-fA-F]{2})/,
        alias: 'constant'
      }
    }
  },
  'keyword': [
    {
      pattern: /\b(if|else|while|for|in|return|break|continue|sfn)\b/,
      alias: 'control'
    },
    {
      pattern: /\b(if|else)\b/,
      alias: 'conditional'
    },
    {
      pattern: /\b(import)\b/,
      alias: 'import'
    },
    {
      pattern: /\b(class|extends|def|func)\b/,
      alias: 'other'
    }
  ],
  'constant': [
    {
      pattern: /\b(true|false|null|(what can i say)|(jvav)|(CLimber-Rong))\b/,
      alias: 'language'
    },
    {
      pattern: /\b([0-9]+)\b/,
      alias: 'numeric'
    },
    {
      pattern: /\b([0-9]+)(\.)([0-9]+)\b/,
      alias: 'numeric'
    }
  ],
  'operator': [
    {
      pattern: /\b(new)\b/,
      alias: 'word'
    },
    {
      pattern: /[(){}[\],;:.]/,
      alias: 'punctuation'
    },
    {
      pattern: /=|\+=|-=|\/=|\*=|%=|&=|\^=|\|=|<<=|>>=/,
      alias: 'assignment'
    },
    {
      pattern: /\+|-|\*|\/|%/,
      alias: 'arithmetic'
    },
    {
      pattern: /\||&|\^|<<|>>|~/,
      alias: 'bitwise'
    },
    {
      pattern: /\|\||&&|!/,
      alias: 'logical'
    },
    {
      pattern: /==|!=|<|>|<=|>=/,
      alias: 'comparison'
    }
  ],
  'variable': [
    {
      pattern: /\b[A-Za-z_][A-Za-z0-9_]*\b/,
      alias: 'other'
    },
    {
      pattern: /\b(self)\b/,
      alias: 'constant'
    }
  ]
};

import { languageMap } from "solid-prism-editor"

languageMap.stamon = {
  comments: {
    line: "//",
  },
  autoIndent: [
    ([start], value) => /[([{][^\n)\]}]*$/.test(value.slice(0, start)),
    ([start, end], value) => /\[]|\(\)|{}/.test(value[start - 1] + value[end])
  ],
  autoCloseTags([start, _end, _direction], value) {
    let match = /<(\w+)\b.*>/.exec(getLineBefore(value, start) + ">")
    return match && `</${match[1]}>`
  },
}

const exampleCode = `// Stamon example
import std;
print("Hello world!");
`

export default () => {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");

  const handleInput = () => {
    const valuePtr = stamon.stringToNewUTF8(input());

    const virtualTextarea = document.createElement("textarea");
    virtualTextarea.id = "result";
    virtualTextarea.style.display = "none";
    document.body.appendChild(virtualTextarea);

    stamon._RunStamon(valuePtr);
    stamon._free(valuePtr);

    setOutput(virtualTextarea.value);

    document.body.removeChild(virtualTextarea);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: "1em" }}>
      <CssBaseline />
      <AppBar position="sticky" color="inherit" elevation={3}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stamon Playground
          </Typography>
          <Button color="inherit" variant="outlined" onClick={handleInput}>Run</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 16px 1fr' },
        gridTemplateRows: { xs: '1fr 16px 1fr', md: 'auto' },
        height: '100%',
        minHeight: 0
      }}>
        <Editor
          language="stamon"
          tabSize={4}
          extensions={basicSetup}
          onUpdate={setInput}
          value={exampleCode}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">::</Typography>
        </Box>
        <Editor
          readOnly
          value={output()}
          style={{ height: '100%' }}
          lineNumbers={false}
        />
      </Box>
    </Box>
  );
}
