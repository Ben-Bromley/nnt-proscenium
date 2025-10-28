import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Composable for role-based admin navigation
 * Returns navigation items filtered by user's roles
 */
export const useAdminNavigation = () => {
  const { hasAnyRole, user } = useAuth()

  /**
   * Full navigation for ADMIN users
   */
  const getAdminNavigation = (): NavigationMenuItem[][] => {
    return [
      [
        {
          label: 'Dashboard',
          icon: 'i-heroicons-home',
          to: '/admin',
          exact: true,
        },
      ],
      [
        {
          label: 'Shows',
          icon: 'i-heroicons-film',
          to: '/admin/shows',
        },
        {
          label: 'Performances',
          icon: 'i-heroicons-calendar-days',
          to: '/admin/performances',
        },
        {
          label: 'Venues',
          icon: 'i-heroicons-building-office',
          to: '/admin/venues',
          children: [
            {
              label: 'All Venues',
              to: '/admin/venues',
            },
            {
              label: 'Features',
              to: '/admin/venue-features',
            },
          ],
        },
      ],
      [
        {
          label: 'Ticket Types',
          icon: 'i-heroicons-ticket',
          to: '/admin/tickets',
        },
        {
          label: 'Content Warnings',
          icon: 'i-heroicons-exclamation-triangle',
          to: '/admin/content-warnings',
        },
        {
          label: 'Reservations',
          icon: 'i-heroicons-clipboard-document-list',
          to: '/admin/reservations',
        },
      ],
      [
        {
          label: 'Front of House',
          icon: 'i-heroicons-users',
          to: '/admin/foh',
          children: [
            {
              label: 'Dashboard',
              to: '/admin/foh',
              description: 'Today\'s overview',
            },
            {
              label: 'Today\'s Shows',
              to: '/admin/foh/performances',
            },
            {
              label: 'Collect Tickets',
              to: '/admin/foh/reservations',
            },
            {
              label: 'Walk-in Sales',
              to: '/admin/foh/customers',
            },
          ],
        },
      ],
      [
        {
          label: 'User Management',
          icon: 'i-heroicons-user-group',
          to: '/admin/users',
        },
      ],
    ]
  }

  /**
   * Navigation for MANAGER users (FOH operations only)
   */
  const getManagerNavigation = (): NavigationMenuItem[][] => {
    return [
      [
        {
          label: 'FOH Dashboard',
          icon: 'i-heroicons-home',
          to: '/admin/foh',
          exact: true,
        },
      ],
      [
        {
          label: 'Today\'s Performances',
          icon: 'i-heroicons-calendar',
          to: '/admin/foh/performances',
        },
        {
          label: 'Reservations',
          icon: 'i-heroicons-clipboard-document-list',
          to: '/admin/foh/reservations',
        },
        {
          label: 'Walk-in Customers',
          icon: 'i-heroicons-users',
          to: '/admin/foh/customers',
        },
      ],
    ]
  }

  /**
   * Navigation for TRAINER users (future - training system)
   */
  const getTrainerNavigation = (): NavigationMenuItem[][] => {
    return [
      [
        {
          label: 'Training Dashboard',
          icon: 'i-heroicons-home',
          to: '/admin/training',
          exact: true,
        },
      ],
      [
        {
          label: 'Training Sessions',
          icon: 'i-heroicons-academic-cap',
          to: '/admin/training/sessions',
        },
        {
          label: 'Resources',
          icon: 'i-heroicons-book-open',
          to: '/admin/training/resources',
        },
        {
          label: 'Attendance',
          icon: 'i-heroicons-clipboard-document-check',
          to: '/admin/training/attendance',
        },
      ],
    ]
  }

  /**
   * Get navigation items based on user's role
   */
  const getNavigationForRole = (): NavigationMenuItem[][] => {
    if (!user.value) return []

    // ADMIN sees everything
    if (hasAnyRole(['ADMIN'])) {
      return getAdminNavigation()
    }

    // MANAGER sees FOH only
    if (hasAnyRole(['MANAGER'])) {
      return getManagerNavigation()
    }

    // TRAINER sees training only (future)
    if (hasAnyRole(['TRAINER'])) {
      return getTrainerNavigation()
    }

    return []
  }

  /**
   * Get the appropriate dashboard route for the user's role
   */
  const getDashboardRoute = (): string => {
    if (!user.value) return '/login'

    // ADMIN gets full admin dashboard
    if (hasAnyRole(['ADMIN'])) {
      return '/admin'
    }

    // MANAGER gets FOH dashboard
    if (hasAnyRole(['MANAGER'])) {
      return '/admin/foh'
    }

    // TRAINER gets training dashboard (future)
    if (hasAnyRole(['TRAINER'])) {
      return '/admin/training'
    }

    // Default fallback
    return '/admin'
  }

  /**
   * Check if user has access to a specific admin section
   */
  const canAccessSection = (section: 'admin' | 'foh' | 'training'): boolean => {
    if (!user.value) return false

    switch (section) {
      case 'admin':
        return hasAnyRole(['ADMIN'])
      case 'foh':
        return hasAnyRole(['ADMIN', 'MANAGER'])
      case 'training':
        return hasAnyRole(['ADMIN', 'TRAINER'])
      default:
        return false
    }
  }

  return {
    navigation: computed(() => getNavigationForRole()),
    dashboardRoute: computed(() => getDashboardRoute()),
    canAccessSection,
  }
}
