import prisma from '../database'

// server/plugins/session.ts
export default defineNitroPlugin(() => {
  // Called when the session is fetched during SSR for the Vue composable (/api/_auth/session)
  // Or when we call useUserSession().fetch()
  sessionHooks.hook('fetch', async (session, _event) => {
    if (!session?.user?.id) {
      return
    }

    // Make sure user data is up-to-date
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        roles: true,
      },
    })

    console.log('Fetched user for session:', user)

    if (user) {
      session.user = {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        setupCompleted: user.setupCompleted,
        roles: user.roles.map(r => r.role),
        profile: {
          name: user.profile?.name,
          avatar: user.profile?.avatar,
        },
      }
    }

    return
  })

  sessionHooks.hook('clear', async (session, _event) => {
    console.log('Session cleared for user ID:', session?.user?.id)
  })
})
