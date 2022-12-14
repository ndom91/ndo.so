import { useEffect, useState } from 'react'
import { Grid } from '@nextui-org/react'
import { AnimatePresence } from 'framer-motion'
import { unstable_getServerSession } from 'next-auth/next'

import { authOptions } from '@/api/auth/[...nextauth]'
import Layout from '@/components/layout'
import CommandMenu from '@/components/commandMenu'
import CommandWrapper from '@/components/commandWrapper'
import HackerNewsList from '@/components/hackernewsList'
import GithubList from '@/components/githubList'
import ShortcutList from '@/components/shortcutList'

export default function Home({ nextauth }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function listener(e) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey) && nextauth?.user) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    function listenerEsc(e) {
      if (e.key === 'Escape' && open) {
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', listener)
    document.addEventListener('keydown', listenerEsc)

    return () => {
      document.removeEventListener('keydown', listener)
      document.removeEventListener('keydown', listenerEsc)
    }
  }, [open, nextauth])

  const logAndClose = () => {
    setOpen(!open)
  }

  return (
    <Layout>
      <AnimatePresence initial={false} mode="wait" onExitComplete={() => null}>
        {open && (
          <>
            <div
              onClick={logAndClose}
              className="fixed top-0 left-0 z-[9998] h-full w-full bg-black bg-opacity-50 transition duration-300 ease-in-out"
            >
              <CommandWrapper onClick={(e) => e.stopPropagation()}>
                <CommandMenu close={setOpen} />
              </CommandWrapper>
            </div>
          </>
        )}
      </AnimatePresence>
      <Grid.Container
        className="h-full space-x-2 p-2 xl:space-x-8 xl:p-6"
        wrap="nowrap"
      >
        <Grid
          justify="flex-start"
          alignItems="stretch"
          className="h-full"
          xs={4}
        >
          <HackerNewsList className="h-full" />
        </Grid>
        <Grid
          justify="flex-start"
          alignItems="stretch"
          className="h-full"
          xs={4}
        >
          <GithubList email={nextauth?.user.email} />
        </Grid>
        <Grid
          justify="flex-start"
          alignItems="stretch"
          className="h-full"
          xs={4}
        >
          <ShortcutList email={nextauth?.user.email} />
        </Grid>
      </Grid.Container>
    </Layout>
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await unstable_getServerSession(req, res, authOptions)
  return {
    props: {
      session,
      nextauth: session,
    },
  }
}
