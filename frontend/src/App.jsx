import { createSignal, createMemo, onMount } from "solid-js"
import CssBaseline from "@suid/material/CssBaseline"
import Box from "@suid/material/Box"
import Toolbar from "@suid/material/Toolbar"
import AppBar from "@suid/material/AppBar"
import Typography from "@suid/material/Typography"
import Button from "@suid/material/Button"
import Menu from "@suid/material/Menu"
import MenuItem from "@suid/material/MenuItem"
import Divider from "@suid/material/Divider"
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import Checkbox from '@suid/material/Checkbox'
import Link from '@suid/material/Link'
import IconButton from '@suid/material/IconButton'
import { createPalette } from "@suid/material/styles/createPalette"
import { ThemeProvider, createTheme } from '@suid/material/styles'
import useMediaQuery from '@suid/material/useMediaQuery'
import SvgIcon from "@suid/material/SvgIcon"
import { mdiGithub, mdiMenu } from '@mdi/js'
import { useDrag } from 'solid-gesture'
import { Editor, languageMap } from "solid-prism-editor"
import { basicSetup } from "solid-prism-editor/setups"
import { languages } from "solid-prism-editor/prism"
import GithubLight from "solid-prism-editor/themes/github-light.css?inline"
import GithubDark from "solid-prism-editor/themes/github-dark.css?inline"
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

const getInitialCode = () => {
  const code = localStorage.getItem("inputCode");
  return code ? code : exampleCode;
}

const getBoolLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  if (value === "true") return true;
  if (value === "false") return false;
}

const saveBoolLocalStorage = (key, value) => {
  localStorage.setItem(key, value ? "true" : "false");
}

export default () => {
  const [input, setInput] = createSignal("");
  const [output, setOutput] = createSignal("");
  const [titleClickTimes, setTitleClickTimes] = createSignal(0);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [darkMode, setDarkMode] = createSignal(getBoolLocalStorage("darkMode") ?? prefersDarkMode);
  onMount(() => changeEditorTheme(darkMode()));

  const palette = createMemo(() => {
    const mode = darkMode() ? "dark" : "light"
    const background = darkMode() ? { default: "#010409", paper: "#010409" } : undefined;
    return createPalette({ mode, background })
  })

  const theme = createTheme({ palette });

  const isSmallScreen = () => window.innerWidth < theme.breakpoints.values.md
  const [wordWrap, setWordWrap] = createSignal(getBoolLocalStorage("wordWrap") ?? isSmallScreen());

  const changeEditorTheme = (darkMode) => {
    const theme = darkMode ? GithubDark : GithubLight
    const style = document.getElementById("prism-theme")
    style.textContent = theme
  };

  const handleInputChange = (value) => {
    setInput(value)
    localStorage.setItem("inputCode", value);
  }

  const handleThemeToggle = () => {
    const nextDarkMode = !darkMode()
    setDarkMode(nextDarkMode)
    saveBoolLocalStorage("darkMode", nextDarkMode)
    changeEditorTheme(nextDarkMode)
    setAnchorEl(null)
  }

  const handleWordWrapToggle = () => {
    setWordWrap(!wordWrap())
    saveBoolLocalStorage("wordWrap", wordWrap())
    setAnchorEl(null)
  }

  const handleRunCode = () => {
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
  const [isVertical, setIsVertical] = createSignal(isSmallScreen());

  let containerRef;

  const dragBind = useDrag(({ down, delta: [mx, my] }) => {
    const { width, height } = {
      width: containerRef.offsetWidth,
      height: containerRef.offsetHeight,
    }

    const delta = isVertical() ? (down ? my : 0) : (down ? mx : 0);
    const size = isVertical() ? height : width;
    const deltaFr = (delta / size) * (leftFr() + rightFr());

    const newLeftFr = Math.max(0.1, leftFr() + deltaFr);
    const newRightFr = Math.max(0.1, rightFr() - deltaFr);

    setLeftFr(newLeftFr);
    setRightFr(newRightFr);
  })

  const handleResize = () => setIsVertical(isSmallScreen())
  onMount(() => window.addEventListener("resize", handleResize))

  const [anchorEl, setAnchorEl] = createSignal(null);
  const openMenu = () => Boolean(anchorEl());
  const handleClose = () => setAnchorEl(null);

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
            <Button color="inherit" variant="outlined" onClick={handleRunCode}>Run</Button>
            <IconButton
              aria-controls={openMenu() ? "function-menu" : undefined}
              aria-expanded={openMenu() ? "true" : undefined}
              aria-haspopup="true"
              sx={{ marginLeft: 2 }}
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <SvgIcon><path d={mdiMenu} /></SvgIcon>
            </IconButton>
            <Menu
              id="function-menu"
              anchorEl={anchorEl()}
              open={openMenu()}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  overflow: "visible",
                  marginTop: 2,
                  width: "150px",
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem dense onClick={handleThemeToggle}>
                <ListItemIcon>
                  <Checkbox size="small" sx={{ padding: 0 }} checked={darkMode()} />
                </ListItemIcon>
                <ListItemText>深色主题</ListItemText>
              </MenuItem>
              <MenuItem dense onClick={handleWordWrapToggle}>
                <ListItemIcon>
                  <Checkbox size="small" sx={{ padding: 0 }} checked={wordWrap()} />
                </ListItemIcon>
                <ListItemText>自动换行</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                dense
                component={Link}
                href="https://github.com/CLimber-Rong/stamon" target="_blank"
              >
                <ListItemIcon>
                  <SvgIcon><path d={mdiGithub} /></SvgIcon>
                </ListItemIcon>
                <ListItemText>Github</ListItemText>
              </MenuItem>
            </Menu>
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
        >
          <style id="prism-theme" />
          <EditorWrapper>
            <Editor
              language="stamon"
              tabSize={4}
              extensions={basicSetup}
              onUpdate={handleInputChange}
              value={getInitialCode()}
              wordWrap={wordWrap()}
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
              touchAction: 'none',
            }}
            {...dragBind()}
          >
            <Typography
              variant="button"
              sx={{
                transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' },
              }}
            >
              ⣿
            </Typography>
          </Box>
          <EditorWrapper>
            <Editor
              readOnly
              value={output()}
              lineNumbers={false}
              wordWrap={wordWrap()}
              extensions={[]}
              style={{ height: '100%' }}
            />
          </EditorWrapper>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
