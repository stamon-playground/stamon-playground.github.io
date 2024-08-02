import { createSignal, createMemo, onMount } from "solid-js"
import CssBaseline from "@suid/material/CssBaseline"
import Box from "@suid/material/Box"
import Toolbar from "@suid/material/Toolbar"
import AppBar from "@suid/material/AppBar"
import Typography from "@suid/material/Typography"
import Button from "@suid/material/Button"
import { createPalette } from "@suid/material/styles/createPalette"
import { ThemeProvider, createTheme } from '@suid/material/styles'
import useMediaQuery from '@suid/material/useMediaQuery'
import IconButton from '@suid/material/IconButton'
import DarkModeOutlinedIcon from "@suid/icons-material/DarkModeOutlined"
import LightModeOutlinedIcon from "@suid/icons-material/LightModeOutlined"
import { Editor, languageMap } from "solid-prism-editor"
import { loadTheme } from "solid-prism-editor/themes"
import { basicSetup } from "solid-prism-editor/setups"
import { languages } from "solid-prism-editor/prism"
import stamon from "./stamon"

import "solid-prism-editor/layout.css"
import "solid-prism-editor/search.css"

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
}

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

const getSavedDarkMode = () => {
  const value = localStorage.getItem("darkMode");
  if (value === "true") return true;
  if (value === "false") return false;
}

const saveDarkMode = (value) => {
  localStorage.setItem("darkMode", value ? "true" : "false");
}

export default () => {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [titleClickTimes, setTitleClickTimes] = createSignal(0);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [darkMode, setDarkMode] = createSignal(getSavedDarkMode() ?? prefersDarkMode);
  onMount(() => changeEditorTheme(darkMode()));

  const palette = createMemo(() =>
    createPalette({
      mode: darkMode() ? "dark" : "light"
    })
  );

  const theme = createTheme({ palette });

  const changeEditorTheme = (darkMode) => {
    loadTheme(darkMode ? "github-dark" : "github-light").then((theme) => {
      const style = document.getElementById("prism-theme");
      style.textContent = theme;
    });
  };

  const handleThemeToggle = () => {
    const nextDarkMode = !darkMode();
    setDarkMode(nextDarkMode);
    saveDarkMode(nextDarkMode);
    changeEditorTheme(nextDarkMode);
  }

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

  const EditorWrapper = (props) => (
    <Box
      sx={{
        minHeight: 0,
        minWidth: 0,
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
      {...props}
    />
  );

  const [leftFr, setLeftFr] = createSignal(1);
  const [rightFr, setRightFr] = createSignal(1);
  const [isDragging, setIsDragging] = createSignal(false);
  const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = createSignal({ width: 0, height: 0 });
  const [isVertical, setIsVertical] = createSignal(window.innerWidth < theme.breakpoints.values.md);

  let containerRef;

  const startDrag = (clientX, clientY) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setContainerSize({
      width: containerRef.offsetWidth,
      height: containerRef.offsetHeight,
    });
  };

  const onMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const onTouchStart = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY);

  const updateDrag = (clientX, clientY) => {
    if (!isDragging()) return;

    const { x: startX, y: startY } = startPos();
    const { width, height } = containerSize();
    const delta = isVertical() ? clientY - startY : clientX - startX;
    const size = isVertical() ? height : width;
    const deltaFr = (delta / size) * (leftFr() + rightFr());

    const newLeftFr = Math.max(0.1, leftFr() + deltaFr);
    const newRightFr = Math.max(0.1, rightFr() - deltaFr);

    setLeftFr(newLeftFr);
    setRightFr(newRightFr);

    setStartPos({ x: clientX, y: clientY });
  };

  const onMouseMove = (e) => updateDrag(e.clientX, e.clientY);
  const onTouchMove = (e) => {
    updateDrag(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  };

  const stopDrag = () => setIsDragging(false);
  const handleResize = () => setIsVertical(window.innerWidth < 960);

  onMount(() => {
    window.addEventListener("resize", handleResize);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        <AppBar position="sticky" color="inherit" elevation={3}>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: "pointer", userSelect: "none" }}
              onClick={() => setTitleClickTimes(titleClickTimes() + 1)}
            >
              <Show
                when={titleClickTimes() % 3 != 0 || titleClickTimes() == 0}
                fallback="SNFQ!"
              >
                Stamon Playground
              </Show>
            </Typography>
            <IconButton
              color="inherit"
              sx={{ marginRight: 2 }}
              onClick={handleThemeToggle}
            >
              <Show
                when={darkMode()}
                fallback={<LightModeOutlinedIcon />}
              >
                <DarkModeOutlinedIcon />
              </Show>
            </IconButton>
            <Button color="inherit" variant="outlined" onClick={handleInput}>Run</Button>
          </Toolbar>
        </AppBar>
        <Box
          ref={containerRef}
          sx={{
            display: 'grid',
            margin: 2,
            height: '100%',
            minWidth: 0,
            minHeight: 0,
            gridTemplateColumns: { xs: '1fr', md: `${leftFr()}fr 16px ${rightFr()}fr` },
            gridTemplateRows: { xs: `${leftFr()}fr 16px ${rightFr()}fr`, md: 'auto' },
          }}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onTouchMove={onTouchMove}
          onTouchEnd={stopDrag}
        >
          <style id="prism-theme" />
          <EditorWrapper>
            <Editor
              language="stamon"
              tabSize={4}
              extensions={basicSetup}
              onUpdate={setInput}
              value={exampleCode}
              style={{ height: '100%' }}
            />
          </EditorWrapper>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: { xs: 'row-resize', md: 'col-resize' },
              userSelect: 'none',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <Typography variant="button">⣿</Typography>
          </Box>
          <EditorWrapper>
            <Editor
              readOnly
              value={output()}
              lineNumbers={false}
              extensions={[]}
              style={{ height: '100%' }}
            />
          </EditorWrapper>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
