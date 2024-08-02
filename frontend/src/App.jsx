import CssBaseline from "@suid/material/CssBaseline"
import Box from "@suid/material/Box"
import Toolbar from "@suid/material/Toolbar"
import AppBar from "@suid/material/AppBar"
import Typography from "@suid/material/Typography"
import Button from "@suid/material/Button"
import Grid from "@suid/material/Grid"
import Paper from "@suid/material/Paper"
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
      pattern: /\b\d+\b/,
      alias: 'numeric'
    },
    {
      pattern: /\b\d+\.\d+\b/,
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
    block: ["/*", "*/"]
  },
  getComments(editor, position) {
    // Method called when a user executes a comment toggling command
    // Useful if a language uses different comment tokens in different contexts
    // Currently used by JSX so {/* */} is used to toggle comments in JSX contexts
  },
  autoIndent: [
    // Whether to indent
    ([start], value) => /[([{][^\n)\]}]*$/.test(value.slice(0, start)),
    // Whether to add an extra line
    ([start, end], value) => /\[]|\(\)|{}/.test(value[start - 1] + value[end])
  ],
  autoCloseTags([start, end, direction], value) {
    // Function called when the user types ">", intended to auto close tags.
    // If a string is returned, it will get inserted behind the cursor.
    let match = /<(\w+)\b.*>/.exec(getLineBefore(value, start) + ">")
		return match && `</${match[1]}>`
  },
}

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="sticky" color="inherit" elevation={3}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stamon Playground
          </Typography>
          <Button color="inherit" onClick={handleInput}>Run</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Grid container spacing={2} sx={{ flex: 1 }}>
          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Editor language="stamon" tabSize={4} style={{ flex: 1 }} extensions={basicSetup} onUpdate={setInput} />
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper variant="outlined" sx={{ flex: 1 }}>
              <Editor readOnly style={{ flex: 1 }} value={output()} lineNumbers={false} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
