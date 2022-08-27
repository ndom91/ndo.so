import { useEffect, useState, useRef } from 'react'
import { Popover } from '@nextui-org/react'
import { Command } from 'cmdk'
import { Logo, FigmaIcon, SlackIcon, YouTubeIcon } from './commandIcons'

export default function CommandMenu({ close }) {
  const [value, setValue] = useState('linear')
  const inputRef = useRef(null)
  const [activeApps, setActiveApps] = useState([])
  const [search, setSearch] = useState('')
  const [pages, setPages] = useState([])
  const page = pages[pages.length - 1]

  const listRef = useRef(null)

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const appsRes = await fetch(`/api/apps`)
        const apps = await appsRes.json()
        setActiveApps(
          apps
            .map((cat) => {
              return cat.apps
            })
            .flatMap((app) => app)
        )
      } catch (e) {
        console.error(e)
      }
    }

    fetchApps()

    inputRef?.current?.focus()
  }, [])

  return (
    <div className="dark raycast">
      <Command
        value={value}
        onValueChange={(v) => setValue(v)}
        onKeyDown={(e) => {
          // Escape goes to previous page
          // Backspace goes to previous page when search is empty
          if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) {
            e.preventDefault()
            setPages((pages) => pages.slice(0, -1))
          }
        }}
      >
        <div cmdk-raycast-top-shine="" />
        <Command.Input
          ref={inputRef}
          value={search}
          onValueChange={setSearch}
          autoFocus
          placeholder="Search for apps and commands..."
        />
        <hr cmdk-raycast-loader="" />
        <Command.List ref={listRef}>
          <Command.Empty>No results found.</Command.Empty>
          {!page && (
            <>
              <Command.Group heading="Suggestions">
                {activeApps.length > 0 &&
                  activeApps.map((app) => (
                    <Item
                      key={app.name}
                      value={app.name}
                      url={app.url}
                      categoryIcon={<ChecklyIcon />}
                      close={close}
                    >
                      <Logo>
                        <img
                          src={`/icons/${app.img}`}
                          alt={`${app.name} Logo`}
                          height={24}
                          width={24}
                        />
                      </Logo>
                      <div className="flex w-full items-center justify-between gap-4 overflow-hidden truncate">
                        <span>{app.name}</span>
                        <span className="overflow-hidden truncate whitespace-nowrap text-xs text-white opacity-30">
                          {app.url.replace('https://', '')}
                        </span>
                      </div>
                    </Item>
                  ))}
                <Item value="Figma" url="https://figma.com" close={close}>
                  <Logo>
                    <FigmaIcon />
                  </Logo>
                  Figma
                </Item>
                <Item value="YouTube" url="https://youtube.com" close={close}>
                  <Logo>
                    <YouTubeIcon />
                  </Logo>
                  YouTube
                </Item>
              </Command.Group>
              <Command.Group heading="Commands">
                <Command.Item
                  onSelect={() => {
                    setSearch('')
                    setPages([...pages, 'pull-request'])
                  }}
                >
                  <Logo>
                    <img
                      height="20"
                      width="20"
                      src="/icons/github.svg"
                      alt="Github Logo"
                    />
                  </Logo>
                  Create new PR
                  <span cmdk-raycast-meta="" className="flex">
                    <ChevronRight />
                  </span>
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    window.open('https://app.shortcut.com/checkly/stories/new')
                  }}
                >
                  <Logo>
                    <img
                      height="20"
                      width="20"
                      src="/icons/shortcut.svg"
                      alt="Github Logo"
                    />
                  </Logo>
                  Create new story
                  <span cmdk-raycast-meta="" className="flex">
                    Command
                  </span>
                </Command.Item>
              </Command.Group>
            </>
          )}

          {(page === 'pull-request' || search) && (
            <Command.Group heading="New Pull Request">
              <Command.Item
                value="checkly/checkly-webapp"
                onSelect={() =>
                  window.open(
                    'https://github.com/checkly/checkly-webapp/compare'
                  )
                }
              >
                <pre>checkly/checkly-webapp</pre>
              </Command.Item>
              <Command.Item
                value="checkly/checkly-backend"
                onSelect={() =>
                  window.open(
                    'https://github.com/checkly/checkly-backend/compare'
                  )
                }
              >
                <pre>checkly/checkly-backend</pre>
              </Command.Item>
              <Command.Item
                value="checkly/checkly-lambda-runners"
                onSelect={() =>
                  window.open(
                    'https://github.com/checkly/checkly-lambda-runners/compare'
                  )
                }
              >
                <pre>checkly/checkly-lamdba-runners</pre>
              </Command.Item>
            </Command.Group>
          )}

          {page === 'teams' && (
            <>
              <Command.Item>Team 1</Command.Item>
              <Command.Item>Team 2</Command.Item>
            </>
          )}
        </Command.List>

        <div cmdk-raycast-footer="" className="flex justify-between">
          <img src="/favicon.png" alt="NDO Logo" height={20} width={28} />
          <button cmdk-raycast-open-trigger="">
            Open Application
            <kbd>↵</kbd>
          </button>
          {/* <SubCommand */}
          {/*   listRef={listRef} */}
          {/*   selectedValue={value} */}
          {/*   inputRef={inputRef} */}
          {/* /> */}
        </div>
      </Command>
    </div>
  )
}

function Item({
  children,
  value,
  url,
  close,
  categoryIcon,
  isCommand = false,
}) {
  const handleSelect = (url, value) => {
    if (url) {
      window.open(url, value)
      close()
    }
  }

  return (
    <Command.Item value={value} onSelect={() => handleSelect(url, value)}>
      {children}
      <span cmdk-raycast-meta="">
        {isCommand ? 'Command' : categoryIcon ? categoryIcon : 'Link'}
      </span>
    </Command.Item>
  )
}

function SubCommand({ inputRef, listRef, selectedValue }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function listener(e) {
      e.preventDefault()
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        console.log('KEY EVENT: ctrl+z')
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])

  useEffect(() => {
    const el = listRef.current

    if (!el) return

    if (open) {
      el.style.overflow = 'hidden'
    } else {
      el.style.overflow = ''
    }
  }, [open, listRef])

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <Popover.Trigger
        cmdk-raycast-subcommand-trigger=""
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <div className="flex justify-end">
          Actions
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </div>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="end"
        className="raycast-submenu"
        sideOffset={16}
        alignOffset={0}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          inputRef?.current?.focus()
        }}
      >
        <Command>
          <Command.List>
            <Command.Group heading={selectedValue}>
              <SubItem shortcut="↵">
                <WindowIcon />
                Open Application
              </SubItem>
              <SubItem shortcut="⌘ ↵">
                <FinderIcon />
                Show in Finder
              </SubItem>
              <SubItem shortcut="⌘ I">
                <FinderIcon />
                Show Info in Finder
              </SubItem>
              <SubItem shortcut="⌘ ⇧ F">
                <StarIcon />
                Add to Favorites
              </SubItem>
            </Command.Group>
          </Command.List>
          <Command.Input placeholder="Search for actions..." />
        </Command>
      </Popover.Content>
    </Popover>
  )
}

function SubItem({ children, shortcut }) {
  return (
    <Command.Item>
      {children}
      <div cmdk-raycast-submenu-shortcuts="">
        {shortcut.split(' ').map((key) => {
          return <kbd key={key}>{key}</kbd>
        })}
      </div>
    </Command.Item>
  )
}

function TerminalIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )
}

function WindowIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.25 4.75V3.75C14.25 2.64543 13.3546 1.75 12.25 1.75H3.75C2.64543 1.75 1.75 2.64543 1.75 3.75V4.75M14.25 4.75V12.25C14.25 13.3546 13.3546 14.25 12.25 14.25H3.75C2.64543 14.25 1.75 13.3546 1.75 12.25V4.75M14.25 4.75H1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FinderIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 4.75V6.25M11 4.75V6.25M8.75 1.75H3.75C2.64543 1.75 1.75 2.64543 1.75 3.75V12.25C1.75 13.3546 2.64543 14.25 3.75 14.25H8.75M8.75 1.75H12.25C13.3546 1.75 14.25 2.64543 14.25 3.75V12.25C14.25 13.3546 13.3546 14.25 12.25 14.25H8.75M8.75 1.75L7.08831 7.1505C6.9202 7.69686 7.32873 8.25 7.90037 8.25C8.36961 8.25 8.75 8.63039 8.75 9.09963V14.25M5 10.3203C5 10.3203 5.95605 11.25 8 11.25C10.0439 11.25 11 10.3203 11 10.3203"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.43376 2.17103C7.60585 1.60966 8.39415 1.60966 8.56624 2.17103L9.61978 5.60769C9.69652 5.85802 9.92611 6.02873 10.186 6.02873H13.6562C14.2231 6.02873 14.4665 6.75397 14.016 7.10088L11.1582 9.3015C10.9608 9.45349 10.8784 9.71341 10.9518 9.95262L12.0311 13.4735C12.2015 14.0292 11.5636 14.4777 11.1051 14.1246L8.35978 12.0106C8.14737 11.847 7.85263 11.847 7.64022 12.0106L4.89491 14.1246C4.43638 14.4777 3.79852 14.0292 3.96889 13.4735L5.04824 9.95262C5.12157 9.71341 5.03915 9.45349 4.84178 9.3015L1.98404 7.10088C1.53355 6.75397 1.77692 6.02873 2.34382 6.02873H5.81398C6.07389 6.02873 6.30348 5.85802 6.38022 5.60769L7.43376 2.17103Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <div cmdk-raycast-clipboard-icon="">
      <svg
        width="32"
        height="32"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.07512 2.75H4.75C3.64543 2.75 2.75 3.64543 2.75 4.75V12.25C2.75 13.3546 3.64543 14.25 4.75 14.25H11.25C12.3546 14.25 13.25 13.3546 13.25 12.25V4.75C13.25 3.64543 12.3546 2.75 11.25 2.75H9.92488M9.88579 3.02472L9.5934 4.04809C9.39014 4.75952 8.73989 5.25 8 5.25V5.25C7.26011 5.25 6.60986 4.75952 6.4066 4.04809L6.11421 3.02472C5.93169 2.38591 6.41135 1.75 7.07573 1.75H8.92427C9.58865 1.75 10.0683 2.3859 9.88579 3.02472Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function HammerIcon() {
  return (
    <div cmdk-raycast-hammer-icon="">
      <svg
        width="32"
        height="32"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.73762 6.19288L2.0488 11.2217C1.6504 11.649 1.6504 12.3418 2.0488 12.769L3.13083 13.9295C3.52923 14.3568 4.17515 14.3568 4.57355 13.9295L9.26238 8.90071M6.73762 6.19288L7.0983 5.80605C7.4967 5.37877 7.4967 4.686 7.0983 4.25872L6.01627 3.09822L6.37694 2.71139C7.57213 1.42954 9.50991 1.42954 10.7051 2.71139L13.9512 6.19288C14.3496 6.62017 14.3496 7.31293 13.9512 7.74021L12.8692 8.90071C12.4708 9.328 11.8248 9.328 11.4265 8.90071L11.0658 8.51388C10.6674 8.0866 10.0215 8.0866 9.62306 8.51388L9.26238 8.90071M6.73762 6.19288L9.26238 8.90071"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function ChevronRight() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

function ChecklyIcon() {
  return (
    <div>
      <svg
        width="52"
        height="47"
        viewBox="0 0 52 47"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M49.7428 10.3674C49.5913 10.0568 49.3707 9.77297 49.0417 9.59181C48.6795 9.39357 48.2837 9.36004 47.9131 9.42601L47.8867 9.41191C42.3147 10.3743 36.6926 14.6174 33.3012 21.121C29.6475 28.1291 29.5947 35.8242 32.571 41.0902C38.55 40.6039 44.7925 36.2176 48.4462 29.2095C51.8513 22.6848 52.1249 15.57 49.7428 10.3674Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M47.8758 10.1439C42.3856 11.1458 37.0523 15.4688 33.9302 21.4568C30.6249 27.7963 30.264 35.1414 32.9682 40.3286C38.725 39.6599 44.5137 35.2131 47.8176 28.8738C50.977 22.8198 51.4673 15.8454 49.0975 10.6694C48.9975 10.4656 48.8657 10.3139 48.7019 10.224C48.513 10.1187 48.2686 10.0905 48.0368 10.1342C47.9814 10.1425 47.9258 10.1495 47.8758 10.1439ZM32.5712 41.8095C32.3172 41.8095 32.0811 41.6719 31.9548 41.447C28.7288 35.7399 29.0034 27.8229 32.6726 20.7853C36.0722 14.2648 41.715 9.74774 47.7676 8.70248C47.8246 8.6912 47.8842 8.68979 47.9426 8.69543C48.4436 8.63494 48.9476 8.72348 49.3793 8.95949C49.8068 9.19408 50.1428 9.56079 50.3801 10.0497C52.9399 15.6388 52.4375 23.1036 49.0752 29.5455C45.4063 36.5815 39.104 41.2811 32.6282 41.8067C32.6086 41.8081 32.5905 41.8095 32.5712 41.8095Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M47.1345 13.4204C48.6866 14.2676 50.065 15.2919 51.2241 16.413C51.0604 14.2381 50.5744 12.1826 49.7429 10.3674C49.5915 10.0568 49.3708 9.77297 49.0418 9.59181C48.6796 9.39357 48.2839 9.36004 47.9132 9.42601L47.8869 9.41191C45.9657 9.74492 44.0445 10.4924 42.2036 11.5601C43.8348 11.9227 45.5117 12.5352 47.1345 13.4204Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M38.4211 15.0051C36.9385 16.4804 35.5239 18.1494 34.2231 20.0097C36.969 19.8185 40.0023 20.4916 42.7508 22.1226C45.4841 23.7413 47.5372 26.0792 48.7143 28.5828C49.6737 26.4978 50.4025 24.4073 50.93 22.3588C49.5015 20.4803 47.6551 18.8126 45.4299 17.492C43.1643 16.146 40.7795 15.3366 38.4211 15.0051Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.3396 23.8398C30.4013 25.6774 29.6113 27.5153 28.9688 29.3362C31.5271 29.2743 34.2244 29.9415 36.6468 31.4406C39.0955 32.9469 40.1894 35.2385 41.3055 37.5961C43.5113 36.5184 44.5899 34.4559 45.7642 32.7529C44.3525 30.2648 42.3189 28.0632 39.6647 26.4278C37.0173 24.7923 34.162 23.9762 31.3396 23.8398Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.1985 3.71308C13.5237 6.065 14.1469 9.25014 12.5894 10.8251C11.0333 12.4 7.88624 11.7707 5.56245 9.41735C3.23867 7.06544 2.6153 3.88029 4.1714 2.30535C5.72766 0.730413 8.87456 1.36117 11.1985 3.71308Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.65764 5.27419C10.8251 6.45156 11.197 7.98999 10.4933 8.70098C9.78538 9.41606 8.26798 9.03948 7.10206 7.85929C5.93739 6.6791 5.56531 5.14491 6.27044 4.43109C6.97711 3.71602 8.49157 4.09401 9.65764 5.27419Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.44548 2.15873C5.93313 2.15873 5.20989 2.2725 4.67416 2.81472C3.41921 4.08486 4.05636 6.87666 6.06505 8.90967C7.34214 10.2022 8.9303 10.9735 10.3144 10.9735C10.8266 10.9735 11.5512 10.8598 12.0871 10.3174C12.6673 9.7302 12.8686 8.80138 12.6535 7.70127C12.4174 6.49585 11.722 5.26082 10.6961 4.22245C9.41896 2.9299 7.83081 2.15873 6.44548 2.15873ZM10.3144 12.4121C8.56101 12.4121 6.59676 11.4835 5.06001 9.92672C2.41835 7.25308 1.80752 3.68164 3.66911 1.79751C4.36603 1.09216 5.32524 0.719971 6.44548 0.719971C8.1987 0.719971 10.163 1.64864 11.7011 3.2054C12.9241 4.44169 13.757 5.93953 14.0472 7.4217C14.3581 9.00792 14.0181 10.3975 13.0921 11.3346C12.3952 12.04 11.4346 12.4121 10.3144 12.4121Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M32.571 3.71333C30.2458 6.06524 29.6224 9.25038 31.1801 10.8253C32.7362 12.4003 35.8832 11.7709 38.207 9.41759C40.5308 7.06568 41.154 3.88054 39.5979 2.3056C38.0418 0.730657 34.8947 1.36142 32.571 3.71333Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.112 5.27419C32.9445 6.45156 32.5724 7.98999 33.2762 8.70098C33.9841 9.41606 35.5015 9.03948 36.6675 7.85929C37.8322 6.6791 38.2043 5.14491 37.4992 4.43109C36.7925 3.71602 35.278 4.09401 34.112 5.27419Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.0736 4.22245C32.0476 5.26082 31.3521 6.49585 31.1161 7.70127C30.9009 8.80138 31.1022 9.7302 31.6825 10.3174C32.2184 10.8598 32.943 10.9735 33.4552 10.9735C34.8393 10.9735 36.4273 10.2022 37.7046 8.90966C39.7131 6.87666 40.3504 4.08486 39.0955 2.81472C38.5596 2.2725 37.8363 2.15873 37.3241 2.15873C35.9387 2.15873 34.3507 2.9299 33.0736 4.22245ZM30.6775 11.3346C29.7516 10.3975 29.4114 9.00792 29.7225 7.4217C30.0126 5.93953 30.8455 4.44169 32.0684 3.2054C33.6065 1.64864 35.5708 0.719971 37.3241 0.719971C38.4444 0.719971 39.4036 1.09216 40.1004 1.79751C41.9621 3.68164 41.3511 7.25308 38.7095 9.92672C37.1727 11.4835 35.2086 12.4121 33.4552 12.4121C32.335 12.4121 31.3744 12.04 30.6775 11.3346Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37.5795 9.56301C33.9147 4.44734 28.2704 0.719971 21.8848 0.719971C15.4992 0.719971 9.8548 4.44734 6.18998 9.56301C1.73116 15.7841 -0.852126 24.6033 1.80053 32.0637C4.04674 38.3834 9.43969 43.1856 15.7808 45.0149C17.7632 45.5882 19.8233 45.8734 21.8848 45.8734C23.9461 45.8734 26.0062 45.5882 27.9886 45.0149C34.3298 43.1856 39.7229 38.3834 41.9691 32.0637C44.6219 24.6033 42.0384 15.7841 37.5795 9.56301Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M39.094 12.3934C38.84 11.3719 38.1945 10.4025 37.5934 9.56241C36.8272 8.49176 35.9694 7.4885 35.0407 6.56125C31.727 4.9512 27.94 4.95402 25.0526 6.92513C23.5478 7.95362 22.4929 9.38956 21.8848 11.0262C21.2768 9.38956 20.2218 7.95362 18.7171 6.92513C15.8295 4.95402 12.0425 4.9512 8.72903 6.56125C7.80032 7.4885 6.94237 8.49176 6.17624 9.56241C5.57501 10.4025 4.9295 11.3719 4.67557 12.3934C4.41034 13.457 4.02867 14.8845 4.07868 15.9606C4.16059 17.7112 5.23081 19.0011 6.644 19.9269C6.9896 20.1545 10.6865 23.0179 10.3421 23.2216C10.6032 23.067 10.9322 22.8787 11.2985 22.6835V23.0108C12.6396 22.2198 14.5885 21.2504 15.8935 21.4021L15.91 21.4049C15.9476 21.4091 15.9782 21.426 16.0142 21.4331C16.3738 21.5285 16.6889 21.7056 16.9304 22.0035C17.4884 22.6905 17.5384 23.4843 17.3441 24.2556C17.4884 24.1489 17.6176 24.014 17.7578 23.9002C17.7425 24.4313 17.6231 24.8345 17.6231 24.8345L17.3802 25.18C18.8113 25.4541 20.3148 25.6044 21.8709 25.6044H21.8793C21.8903 25.6044 21.8932 25.6044 21.8932 25.6044C23.4547 25.6044 24.9582 25.4541 26.3895 25.18L26.1466 24.8345C26.1466 24.8345 26.0272 24.4313 26.0119 23.9002C26.152 24.014 26.2811 24.1489 26.4256 24.2556C26.2313 23.4843 26.2811 22.6905 26.8393 22.0035C27.0807 21.7056 27.3959 21.5285 27.7555 21.4331C27.7915 21.426 27.8222 21.4091 27.8597 21.4049L27.8762 21.4021C29.181 21.2504 31.1301 22.2198 32.4712 23.0108V22.6835C32.8375 22.8787 33.1665 23.067 33.4276 23.2216C33.0832 23.0179 36.7799 20.1545 37.1255 19.9269C38.5387 19.0011 39.6091 17.7112 39.691 15.9606C39.741 14.8845 39.3592 13.457 39.094 12.3934Z"
          fill="#EDEDEA"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.8849 28.5366C16.5029 28.5366 12.1426 33.9712 12.1426 40.6757C12.1426 42.0147 12.3231 43.2975 12.6438 44.5015C13.2323 44.6799 13.8154 44.8723 14.4193 45.0143C16.8443 45.5875 19.364 45.8727 21.8849 45.8727C24.4058 45.8727 26.9254 45.5875 29.3506 45.0143C29.9543 44.8723 30.5374 44.6799 31.126 44.5015C31.4466 43.2975 31.6272 42.0147 31.6272 40.6757C31.6272 33.9712 27.2668 28.5366 21.8849 28.5366Z"
          fill="#EDEDEA"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9844 17.5341C22.7444 17.6129 22.4931 17.6523 22.2418 17.6733C22.2613 17.6297 22.2972 17.596 22.2972 17.5468V16.5717C22.3418 16.5366 22.3904 16.5128 22.4291 16.465L23.1842 15.5406C23.4828 15.1753 23.3426 14.876 22.8733 14.876H20.8967C20.4274 14.876 20.2873 15.1753 20.5856 15.5406L21.3408 16.465C21.4075 16.5479 21.488 16.6054 21.5699 16.6504V17.5468C21.5699 17.596 21.6046 17.6297 21.6227 17.6733C21.3713 17.6507 21.1215 17.6114 20.8828 17.5341C20.5745 17.4344 19.9373 17.0607 19.8499 17.641C19.8499 17.6761 19.8499 17.7112 19.8499 17.7463C19.8499 18.9083 20.7773 19.8497 21.9309 19.8525H21.9363C23.09 19.8497 24.0171 18.9083 24.0171 17.7463C24.0171 17.7112 24.0171 17.6761 24.0171 17.641C23.9298 17.0607 23.2926 17.4344 22.9844 17.5341Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.8849 1.43861C16.167 1.43861 10.6559 4.55355 6.76626 9.98514C1.86878 16.8176 0.18215 25.3879 2.46986 31.82C4.57145 37.735 9.7467 42.5261 15.9755 44.3231C19.7902 45.4245 23.9811 45.4245 27.793 44.3231C34.0232 42.5261 39.1983 37.735 41.2999 31.82C43.5877 25.3879 41.9011 16.8176 37.005 9.98514C33.1138 4.55355 27.6029 1.43861 21.8849 1.43861ZM21.8849 46.592C19.7388 46.592 17.619 46.2943 15.5853 45.7055C8.82357 43.7554 3.42071 38.7467 1.13161 32.3062C-1.83212 23.9717 1.50507 14.8745 5.61551 9.13937C9.77581 3.33104 15.7062 0 21.8849 0C28.0637 0 33.9941 3.33104 38.1558 9.13937C42.2648 14.8745 45.602 23.9717 42.6383 32.3062C40.3492 38.7467 34.9463 43.7554 28.1832 45.7055C26.1508 46.2943 24.031 46.592 21.8849 46.592Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.174 9.2024C15.5743 8.87503 14.9053 8.70923 14.1847 8.70923C12.1746 8.70923 10.1728 10.4178 9.19134 11.567C7.54093 13.4989 6.01394 17.385 9.17059 18.7183C10.3117 19.2004 11.5693 19.3464 12.7965 19.3688C14.3638 19.3997 16.0393 19.3634 17.2763 18.2449C18.5311 17.1097 18.7337 15.2552 18.6172 13.645C18.4659 11.5543 17.5982 9.97514 16.174 9.2024Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.2485 12.5605C16.2262 12.2852 15.9278 11.9817 15.7529 11.8243C15.3629 11.4801 14.8645 11.2891 14.3468 11.2891C14.1831 11.2891 14.0151 11.3072 13.8444 11.3439C13.1837 11.4843 12.6284 11.8875 12.3217 12.4508C12.2051 12.6644 12.0066 13.0901 12.0578 13.3332C12.1009 13.5355 12.2898 13.6745 12.4827 13.7096C12.7394 13.7574 12.8394 13.6351 12.9616 13.4245C12.9851 13.3836 13.01 13.3415 13.0379 13.2967C13.4098 12.7136 13.9346 12.3933 14.5161 12.3933C14.8423 12.3933 15.0408 12.4887 15.3365 12.687C15.5308 12.8176 15.7433 13.0803 16.0069 12.9397C16.1971 12.8372 16.2596 12.7037 16.2485 12.5605Z"
          fill="#FFFFFE"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.5961 9.2024C28.1957 8.87503 28.8648 8.70923 29.5852 8.70923C31.5955 8.70923 33.5971 10.4178 34.5786 11.567C36.2291 13.4989 37.7561 17.385 34.5995 18.7183C33.4583 19.2004 32.2006 19.3464 30.9735 19.3688C29.4063 19.3997 27.7308 19.3634 26.4938 18.2449C25.2388 17.1097 25.0361 15.2552 25.1527 13.645C25.3042 11.5543 26.1717 9.97514 27.5961 9.2024Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.521 12.5605C27.5433 12.2852 27.8418 11.9817 28.0166 11.8243C28.4067 11.4801 28.905 11.2891 29.4227 11.2891C29.5865 11.2891 29.7545 11.3072 29.9252 11.3439C30.5859 11.4843 31.1412 11.8875 31.4479 12.4508C31.5645 12.6644 31.763 13.0901 31.7117 13.3332C31.6686 13.5355 31.48 13.6745 31.2868 13.7096C31.0301 13.7574 30.9302 13.6351 30.808 13.4245C30.7844 13.3836 30.7594 13.3415 30.7317 13.2967C30.3597 12.7136 29.8351 12.3933 29.2535 12.3933C28.9271 12.3933 28.7288 12.4887 28.4331 12.687C28.2387 12.8176 28.0263 13.0803 27.7627 12.9397C27.5724 12.8372 27.51 12.7037 27.521 12.5605Z"
          fill="#FFFFFE"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.77821 25.6589C7.58948 25.6589 7.40059 25.583 7.26048 25.4328C6.99109 25.1433 7.00502 24.6881 7.29098 24.4155C7.45339 24.261 8.9109 22.8871 9.94497 22.3826C10.2961 22.2128 10.7223 22.3602 10.893 22.7184C11.0637 23.0753 10.9152 23.5052 10.5612 23.6779C9.85331 24.0236 8.6638 25.0843 8.26544 25.4636C8.12796 25.5943 7.95301 25.6589 7.77821 25.6589Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.2698 21.093C14.3082 19.8989 11.2528 21.5622 10.1952 22.2155C9.32327 21.7829 8.55435 21.1505 7.85046 20.4804C7.00227 19.674 6.46917 19.1667 5.90293 18.1074C5.76962 17.9107 5.56136 17.7646 5.30728 17.7646C4.47581 17.7646 4.48974 18.6554 4.82001 19.1808C5.83899 20.7994 7.00227 21.8476 8.5751 22.9181C9.01793 23.2188 9.48569 23.497 9.98411 23.6965C10.2006 23.7836 10.4519 23.7612 10.6476 23.6291C11.5139 23.046 14.2612 21.5539 15.5396 22.3267C16.1615 22.7045 16.4933 23.2245 16.5252 23.8721C16.5821 25.0396 15.6576 26.4586 14.0515 27.6697C12.4023 28.9132 9.49127 29.263 6.97456 28.5225C5.18233 27.9957 2.79614 26.7003 1.6022 23.5293C1.46347 23.1555 1.04835 22.9701 0.686033 23.1133C0.318142 23.2539 0.134971 23.6698 0.275098 24.0408C1.36902 26.9477 3.60687 29.0298 6.57755 29.9038C7.59638 30.2044 8.66119 30.3504 9.70231 30.3504C11.6845 30.3504 13.5794 29.8209 14.9009 28.8247C16.918 27.303 18.0272 25.4725 17.9439 23.8005C17.8883 22.6764 17.2942 21.7155 16.2698 21.093Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M35.9913 25.6589C36.1801 25.6589 36.3689 25.583 36.5091 25.4328C36.7783 25.1433 36.7644 24.6881 36.4786 24.4155C36.3161 24.261 34.8586 22.8871 33.8246 22.3826C33.4734 22.2128 33.0474 22.3602 32.8764 22.7184C32.7058 23.0753 32.8543 23.5052 33.2082 23.6779C33.9162 24.0236 35.1057 25.0843 35.5041 25.4636C35.6414 25.5943 35.8164 25.6589 35.9913 25.6589Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.5 21.093C29.4615 19.8989 32.517 21.5622 33.5747 22.2155C34.4466 21.7829 35.2157 21.1505 35.9192 20.4804C36.7676 19.674 37.3005 19.1667 37.8671 18.1074C38.0002 17.9107 38.2085 17.7646 38.4624 17.7646C39.2939 17.7646 39.2803 18.6554 38.9498 19.1808C37.9309 20.7994 36.7676 21.8476 35.1948 22.9181C34.7518 23.2188 34.2842 23.497 33.7857 23.6965C33.5691 23.7836 33.318 23.7612 33.1221 23.6291C32.256 23.046 29.5087 21.5539 28.2302 22.3267C27.6084 22.7045 27.2766 23.2245 27.2445 23.8721C27.1877 25.0396 28.1122 26.4586 29.7183 27.6697C31.3675 28.9132 34.2786 29.263 36.7953 28.5225C38.5875 27.9957 40.9737 26.7003 42.1675 23.5293C42.3062 23.1555 42.7214 22.9701 43.0838 23.1133C43.4516 23.2539 43.6349 23.6698 43.4946 24.0408C42.4008 26.9477 40.1631 29.0298 37.1923 29.9038C36.1733 30.2044 35.1087 30.3504 34.0675 30.3504C32.0852 30.3504 30.1903 29.8209 28.8688 28.8247C26.8517 27.303 25.7426 25.4725 25.8259 23.8005C25.8813 22.6764 26.4754 21.7155 27.5 21.093Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.2386 35.7442C13.5682 38.1018 14.0845 41.4063 12.3881 43.1219C10.6918 44.8388 7.42672 44.3202 5.09736 41.9613C2.768 39.6009 2.25163 36.2991 3.9508 34.5822C5.6444 32.864 8.90944 33.3853 11.2386 35.7442Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.4547 38.4783C11.7345 39.7765 11.9456 41.6675 10.9226 42.7043C9.89803 43.7415 8.02668 43.5307 6.74541 42.2325C5.46274 40.9329 5.25185 39.0403 6.27625 38.0033C7.30065 36.9665 9.172 37.18 10.4547 38.4783Z"
          fill="#EDEDEA"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.56085 34.2885C5.69872 34.2885 4.9713 34.5654 4.45353 35.0908C3.79702 35.754 3.53458 36.7585 3.71651 37.919C3.90943 39.1625 4.57848 40.4171 5.60025 41.4527C7.56032 43.4393 10.5268 43.9914 11.886 42.6131C12.5411 41.9499 12.8022 40.9468 12.6216 39.7862C12.4273 38.5414 11.7582 37.2868 10.7365 36.2528C9.52179 35.0234 7.9615 34.2885 6.56085 34.2885ZM9.77588 44.8541C7.97962 44.8541 6.0917 43.9843 4.5952 42.4697C3.3624 41.2221 2.55183 39.6837 2.31168 38.1424C2.05759 36.5155 2.46156 35.0698 3.44864 34.0736C4.23707 33.2728 5.31287 32.8499 6.56085 32.8499C8.35572 32.8499 10.2452 33.7194 11.7415 35.2355C12.9743 36.4832 13.7849 38.0188 14.0251 39.5615C14.2791 41.1886 13.8766 42.6341 12.8909 43.6305C12.0997 44.4311 11.0225 44.8541 9.77588 44.8541Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M32.5311 35.7442C30.2017 38.1018 29.6853 41.4063 31.3817 43.1219C33.0781 44.8388 36.343 44.3202 38.6725 41.9613C41.0019 39.6009 41.5182 36.2991 39.8191 34.5822C38.1255 32.864 34.8604 33.3853 32.5311 35.7442Z"
          fill="#828D8C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.3151 38.4783C32.0354 39.7765 31.8242 41.6675 32.8475 42.7043C33.8719 43.7415 35.7431 43.5307 37.0244 42.2325C38.307 40.9329 38.5181 39.0403 37.4935 38.0033C36.4691 36.9665 34.5978 37.18 33.3151 38.4783Z"
          fill="#EDEDEA"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M33.0335 36.2528C32.0117 37.2868 31.3427 38.5414 31.1482 39.7862C30.9678 40.9468 31.2289 41.9499 31.884 42.6131C33.243 43.9914 36.2095 43.4393 38.1697 41.4527C39.1913 40.4171 39.8605 39.1625 40.0535 37.919C40.2352 36.7585 39.973 35.754 39.3163 35.0908C38.7985 34.5654 38.0711 34.2885 37.2091 34.2885C35.8085 34.2885 34.2482 35.0234 33.0335 36.2528ZM30.879 43.6305C29.8934 42.6341 29.4908 41.1886 29.7449 39.5615C29.9849 38.0188 30.7958 36.4832 32.0285 35.2355C33.525 33.7194 35.4143 32.8499 37.2091 32.8499C38.457 32.8499 39.5329 33.2728 40.3213 34.0736C41.3084 35.0698 41.7124 36.5155 41.4583 38.1424C41.2182 39.6837 40.4074 41.2221 39.1748 42.4697C37.6783 43.9843 35.7902 44.8541 33.9941 44.8541C32.7475 44.8541 31.6702 44.4311 30.879 43.6305Z"
          fill="#121716"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.3449 1.54881C26.3782 1.44209 26.4129 1.33819 26.4434 1.22568C24.9664 0.898464 23.4436 0.719971 21.8847 0.719971C20.3256 0.719971 18.803 0.898464 17.3258 1.22568C17.3565 1.33819 17.3912 1.44209 17.4245 1.54881L16.6484 1.68656L16.7567 2.02098L16.7914 2.28222C17.0177 2.20214 17.2579 2.15011 17.5147 2.15011C17.9269 2.15011 18.3628 2.32171 18.703 2.54926C19.9828 3.42025 20.9199 4.5948 21.5529 5.92543C21.6236 6.02792 21.7265 6.10941 21.8722 6.10941C22.0332 6.10941 22.1484 6.01398 22.2179 5.89597H22.2289C22.8634 4.57803 23.7949 3.41477 25.0664 2.54926C25.4064 2.32171 25.8423 2.15011 26.2546 2.15011C26.5115 2.15011 26.7515 2.20214 26.9779 2.28222L27.0126 2.02098L27.1208 1.68656L26.3449 1.54881Z"
          fill="#121716"
        />
      </svg>
    </div>
  )
}
